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
  stateMachine: sfn.StateMachine;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = new apigateway.RestApi(this, 'TutorialApi', {
      restApiName: 'TutorialPlatformApi',
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

    const sharedEnv = {
      TABLE_NAME: props.table.tableName,
      CONTENT_BUCKET: props.contentBucket.bucketName,
      USER_POOL_ID: props.userPool.userPoolId,
    };

    const createFn = (name: string, timeout = 30, memorySize = 256, extraEnv: Record<string, string> = {}): lambda.Function => {
      const fn = new lambda.Function(this, `${name}Function`, {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'main.handler',
        code: lambda.Code.fromAsset(`../backend/api/${name.toLowerCase()}`),
        timeout: cdk.Duration.seconds(timeout),
        memorySize,
        environment: { ...sharedEnv, ...extraEnv },
      });
      props.table.grantReadWriteData(fn);
      return fn;
    };

    // Auth Service (no Cognito authorizer on auth routes)
    const authFn = createFn('auth');
    authFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminInitiateAuth', 'cognito-idp:AdminGetUser'],
      resources: [props.userPool.userPoolArn],
    }));

    // Curriculum Service
    const curriculumFn = createFn('curriculum', 30, 512, {
      STATE_MACHINE_ARN: props.stateMachine.stateMachineArn,
    });
    props.stateMachine.grantStartExecution(curriculumFn);

    // Content Service
    const contentFn = createFn('content');
    props.contentBucket.grantRead(contentFn);

    // Assessment Service
    const assessmentFn = createFn('assessment', 60, 512);
    assessmentFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

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

    const profile = this.api.root.addResource('profile');
    profile.addMethod('GET', new apigateway.LambdaIntegration(authFn), authMethodOpts);
    profile.addMethod('PUT', new apigateway.LambdaIntegration(authFn), authMethodOpts);

    const curricula = this.api.root.addResource('curricula');
    curricula.addResource('generate').addMethod('POST', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curricula.addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    const curriculumById = curricula.addResource('{id}');
    curriculumById.addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curriculumById.addResource('assign').addMethod('POST', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);
    curricula.addResource('wizard').addResource('categories').addMethod('GET', new apigateway.LambdaIntegration(curriculumFn), authMethodOpts);

    const content = this.api.root.addResource('content');
    content.addResource('lessons').addResource('{id}').addMethod('GET', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    content.addResource('review-queue').addMethod('GET', new apigateway.LambdaIntegration(contentFn), authMethodOpts);
    const contentById = content.addResource('{id}');
    contentById.addResource('review').addMethod('POST', new apigateway.LambdaIntegration(contentFn), authMethodOpts);

    const assessments = this.api.root.addResource('assessments');
    const quiz = assessments.addResource('quiz').addResource('{id}');
    quiz.addMethod('GET', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);
    quiz.addResource('submit').addMethod('POST', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);
    const preAssessment = assessments.addResource('pre-assessment').addResource('{currId}');
    preAssessment.addMethod('GET', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);
    preAssessment.addResource('submit').addMethod('POST', new apigateway.LambdaIntegration(assessmentFn), authMethodOpts);

    const progress = this.api.root.addResource('progress');
    progress.addResource('dashboard').addMethod('GET', new apigateway.LambdaIntegration(progressFn), authMethodOpts);
    const progressByCurr = progress.addResource('{currId}');
    progressByCurr.addMethod('GET', new apigateway.LambdaIntegration(progressFn), authMethodOpts);
    progressByCurr.addResource('resume-point').addMethod('PUT', new apigateway.LambdaIntegration(progressFn), authMethodOpts);

    const admin = this.api.root.addResource('admin');
    admin.addResource('learners').addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);
    const adminCourses = admin.addResource('courses');
    adminCourses.addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);
    adminCourses.addResource('{id}').addResource('archive').addMethod('PUT', new apigateway.LambdaIntegration(adminFn), authMethodOpts);
    admin.addResource('review-backlog').addMethod('GET', new apigateway.LambdaIntegration(adminFn), authMethodOpts);

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.url });
  }
}
