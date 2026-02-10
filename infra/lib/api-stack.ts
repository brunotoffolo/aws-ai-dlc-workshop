import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';

interface ApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  contentBucket: s3.Bucket;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  stateMachine: sfn.StateMachine;
  contentAgentArn?: string;
  assessmentAgentArn?: string;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') || 'dev';

    // Shared Lambda Layer (auto-built from backend/shared/)
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset('../backend/shared'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      description: 'Shared library: models, db, s3, auth utilities',
    });

    this.api = new apigateway.RestApi(this, 'TutorialApi', {
      restApiName: `${env}-TutorialPlatformApi`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuth', {
      cognitoUserPools: [props.userPool],
    });
    const authMethodOpts: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    const createFn = (name: string, extraEnv: Record<string, string> = {}, timeout = 30, memorySize = 256): lambda.Function => {
      const fn = new lambda.Function(this, `${name}Function`, {
        runtime: lambda.Runtime.PYTHON_3_12,
        architecture: lambda.Architecture.ARM_64,
        handler: 'handler.lambda_handler',
        code: lambda.Code.fromAsset(`../backend/api/${name.toLowerCase()}`),
        timeout: cdk.Duration.seconds(timeout),
        memorySize,
        layers: [sharedLayer],
        environment: {
          TABLE_NAME: props.table.tableName,
          CONTENT_BUCKET_NAME: props.contentBucket.bucketName,
          LOG_LEVEL: env === 'dev' ? 'DEBUG' : 'INFO',
          ...extraEnv,
        },
      });
      props.table.grantReadWriteData(fn);
      return fn;
    };

    // Auth Service
    const authFn = createFn('auth', {
      USER_POOL_ID: props.userPool.userPoolId,
      USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
    });
    authFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:SignUp', 'cognito-idp:ConfirmSignUp', 'cognito-idp:InitiateAuth', 'cognito-idp:AdminGetUser'],
      resources: [props.userPool.userPoolArn],
    }));

    // Curriculum Service
    const curriculumFn = createFn('curriculum', {
      PIPELINE_STATE_MACHINE_ARN: props.stateMachine.stateMachineArn,
    });
    props.stateMachine.grantStartExecution(curriculumFn);
    curriculumFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['states:DescribeExecution'],
      resources: ['*'],
    }));

    // Content Service
    const contentFn = createFn('content', {
      CONTENT_AGENT_ARN: props.contentAgentArn || '',
    });
    props.contentBucket.grantReadWrite(contentFn);

    // Assessment Service
    const assessmentFn = createFn('assessment', {
      ASSESSMENT_AGENT_ARN: props.assessmentAgentArn || '',
    }, 60);

    // Progress Service
    const progressFn = createFn('progress');

    // Admin Service
    const adminFn = createFn('admin');

    // --- Routes ---
    const auth = this.api.root.addResource('auth');
    auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(authFn));
    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(authFn));
    auth.addResource('verify').addMethod('POST', new apigateway.LambdaIntegration(authFn));
    auth.addResource('refresh').addMethod('POST', new apigateway.LambdaIntegration(authFn));
    auth.addResource('profile').addMethod('GET', new apigateway.LambdaIntegration(authFn), authMethodOpts);
    auth.addResource('profile-update').addMethod('PUT', new apigateway.LambdaIntegration(authFn), authMethodOpts);

    const curricula = this.api.root.addResource('curricula');
    curricula.addResource('generate').addMethod('POST', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curricula.addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curricula.addResource('assign').addMethod('POST', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curricula.addResource('wizard').addResource('categories').addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    const curriculumById = curricula.addResource('{id}');
    curriculumById.addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curriculumById.addResource('status').addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curriculumById.addResource('archive').addMethod('POST', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);

    const content = this.api.root.addResource('content');
    content.addResource('review-queue').addMethod('GET', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    const contentByCurr = content.addResource('{curriculumId}');
    const contentByLesson = contentByCurr.addResource('{lessonId}');
    contentByLesson.addMethod('GET', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    contentByLesson.addResource('review').addMethod('POST', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    contentByLesson.addResource('regenerate').addMethod('POST', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    contentByLesson.addResource('versions').addMethod('GET', new apigateway.LambdaIntegration(contentFn), authMethodOpts);

    const quizzes = this.api.root.addResource('quizzes');
    const quizByCurr = quizzes.addResource('{curriculumId}');
    const quizById = quizByCurr.addResource('{quizId}');
    quizById.addMethod('GET', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);
    quizById.addResource('submit').addMethod('POST', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);
    const preAssessment = curricula.addResource('pre-assessment');
    // Note: pre-assessment routes use curricula/{id}/pre-assessment path
    // Handled by assessment Lambda via curriculum ID path param

    const progress = this.api.root.addResource('progress');
    const progressByCurr = progress.addResource('{curriculumId}');
    progressByCurr.addMethod('GET', new apigateway.LambdaIntegration(progressFn), authMethodOpts);
    const resume = progressByCurr.addResource('resume');
    resume.addMethod('GET', new apigateway.LambdaIntegration(progressFn), authMethodOpts);
    resume.addMethod('PUT', new apigateway.LambdaIntegration(progressFn), authMethodOpts);
    const lessons = progressByCurr.addResource('lessons');
    lessons.addResource('{lessonId}').addResource('complete').addMethod('POST', new apigateway.LambdaIntegration(progressFn), authMethodOpts);

    const dashboard = this.api.root.addResource('dashboard');
    dashboard.addMethod('GET', new apigateway.LambdaIntegration(progressFn), authMethodOpts);

    const admin = this.api.root.addResource('admin');
    admin.addResource('learners').addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);
    admin.addResource('courses').addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);
    admin.addResource('review-backlog').addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.url });
  }
}
