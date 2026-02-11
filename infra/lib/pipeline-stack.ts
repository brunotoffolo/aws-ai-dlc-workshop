import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

interface PipelineStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  contentBucket: s3.Bucket;
}

export class PipelineStack extends cdk.Stack {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const bedrockPolicy = new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['*'],
    });

    const createTaskFn = (name: string, timeout = 300, memorySize = 512): lambda.Function => {
      const fn = new lambda.Function(this, `${name}Fn`, {
        runtime: lambda.Runtime.PYTHON_3_12,
        architecture: lambda.Architecture.ARM_64,
        handler: 'handler.lambda_handler',
        code: lambda.Code.fromAsset(`../.build/lambdas/pipeline_${name}`),
        timeout: cdk.Duration.seconds(timeout),
        memorySize,
        environment: {
          TABLE_NAME: props.table.tableName,
          CONTENT_BUCKET: props.contentBucket.bucketName,
          CONTENT_BUCKET_NAME: props.contentBucket.bucketName,
        },
      });
      props.table.grantReadWriteData(fn);
      props.contentBucket.grantReadWrite(fn);
      fn.addToRolePolicy(bedrockPolicy);
      return fn;
    };

    const researchFn = createTaskFn('research_task', 120, 512);
    const contentQuizFn = createTaskFn('content_quiz_task', 300, 1024);
    const storeResultsFn = createTaskFn('store_results_task', 60, 256);

    // Step Functions definition using CDK constructs
    const researchStep = new tasks.LambdaInvoke(this, 'Research', {
      lambdaFunction: researchFn,
      resultPath: '$.researchOutput',
      retryOnServiceExceptions: true,
    }).addRetry({ maxAttempts: 3, interval: cdk.Duration.seconds(5), backoffRate: 2 });

    // Flatten research output into lesson list with context
    const generateOutline = new sfn.Pass(this, 'GenerateOutline', {
      comment: 'Flatten modules into lesson list for Map state',
      parameters: {
        'curriculumId.$': '$.curriculum_id',
        'userId.$': '$.user_id',
        'researchFindings.$': '$.researchOutput.Payload',
        'programLevel.$': '$.program_level',
        'testType.$': '$.test_type',
        'lessons.$': '$.researchOutput.Payload.modules[*].lessons[*]',
      },
    });

    const contentQuizStep = new tasks.LambdaInvoke(this, 'GenerateContentAndQuiz', {
      lambdaFunction: contentQuizFn,
      outputPath: '$.Payload',
      retryOnServiceExceptions: true,
    }).addRetry({ maxAttempts: 2, interval: cdk.Duration.seconds(5), backoffRate: 2 });

    const lessonFailed = new sfn.Pass(this, 'LessonFailed', {
      result: sfn.Result.fromObject({ status: 'FAILED' }),
      resultPath: '$.lessonStatus',
    });

    contentQuizStep.addCatch(lessonFailed, { resultPath: '$.error' });

    const processLessons = new sfn.Map(this, 'ProcessLessons', {
      itemsPath: '$.lessons',
      maxConcurrency: 5,
      resultPath: '$.lessons',
      parameters: {
        'lesson.$': '$$.Map.Item.Value',
        'index.$': '$$.Map.Item.Index',
        'curriculumId.$': '$.curriculumId',
        'researchFindings.$': '$.researchFindings',
        'programLevel.$': '$.programLevel',
        'testType.$': '$.testType',
        'bloomsLevel': 1,
      },
    });
    processLessons.itemProcessor(contentQuizStep);

    const storeStep = new tasks.LambdaInvoke(this, 'StoreResults', {
      lambdaFunction: storeResultsFn,
      outputPath: '$.Payload',
    });

    const pipelineComplete = new sfn.Succeed(this, 'PipelineComplete');
    const pipelineFailed = new sfn.Fail(this, 'PipelineFailed', {
      error: 'PipelineError',
      cause: 'Curriculum generation pipeline failed',
    });

    researchStep.addCatch(pipelineFailed, { resultPath: '$.error' });

    const definition = researchStep
      .next(generateOutline)
      .next(processLessons)
      .next(storeStep)
      .next(pipelineComplete);

    this.stateMachine = new sfn.StateMachine(this, 'CurriculumPipeline', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(30),
    });

    new cdk.CfnOutput(this, 'StateMachineArn', { value: this.stateMachine.stateMachineArn });
  }
}
