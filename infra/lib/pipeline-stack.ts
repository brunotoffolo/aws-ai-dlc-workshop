import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

interface PipelineStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  contentBucket: s3.Bucket;
}

/**
 * Step Functions state machine for the curriculum generation pipeline.
 * Uses ASL definition with placeholder task resources.
 * Replace AgentCore task ARNs once agents are deployed.
 */
export class PipelineStack extends cdk.Stack {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const pipelineRole = new iam.Role(this, 'PipelineRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });
    props.table.grantReadWriteData(pipelineRole);
    props.contentBucket.grantReadWrite(pipelineRole);
    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['*'],
    }));
    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: ['*'], // Scoped down when Lambda ARNs available
    }));

    // ASL definition — placeholder resource ARNs to be replaced with actual agent/lambda ARNs
    const definition = {
      Comment: 'Curriculum Generation Pipeline',
      StartAt: 'Research',
      States: {
        Research: {
          Type: 'Task',
          Resource: 'arn:aws:states:::bedrock:invokeModel', // Placeholder: replace with AgentCore task
          Parameters: {
            'topic.$': '$.topic',
            'programLevel.$': '$.programLevel',
          },
          ResultPath: '$.researchFindings',
          TimeoutSeconds: 300,
          Retry: [{ ErrorEquals: ['States.ALL'], MaxAttempts: 3, IntervalSeconds: 5, BackoffRate: 2 }],
          Catch: [{ ErrorEquals: ['States.ALL'], Next: 'PipelineFailed', ResultPath: '$.error' }],
          Next: 'GenerateOutline',
        },
        GenerateOutline: {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke', // Placeholder: generate-outline Lambda
          Parameters: {
            'Payload': {
              'topic.$': '$.topic',
              'researchFindings.$': '$.researchFindings',
            },
          },
          ResultPath: '$.outline',
          Next: 'ProcessLessons',
        },
        ProcessLessons: {
          Type: 'Map',
          ItemsPath: '$.outline.lessons',
          MaxConcurrency: 3,
          Iterator: {
            StartAt: 'GenerateContent',
            States: {
              GenerateContent: {
                Type: 'Task',
                Resource: 'arn:aws:states:::bedrock:invokeModel', // Placeholder: Content Agent
                Parameters: {
                  'lesson.$': '$',
                  'researchFindings.$': '$$.Execution.Input.researchFindings',
                },
                ResultPath: '$.content',
                TimeoutSeconds: 300,
                Retry: [{ ErrorEquals: ['States.ALL'], MaxAttempts: 2, IntervalSeconds: 5, BackoffRate: 2 }],
                Catch: [{ ErrorEquals: ['States.ALL'], Next: 'LessonFailed', ResultPath: '$.error' }],
                Next: 'GenerateQuiz',
              },
              GenerateQuiz: {
                Type: 'Task',
                Resource: 'arn:aws:states:::bedrock:invokeModel', // Placeholder: Assessment Agent
                Parameters: {
                  'lessonContent.$': '$.content',
                  'testType.$': '$$.Execution.Input.testType',
                },
                ResultPath: '$.quiz',
                TimeoutSeconds: 120,
                Retry: [{ ErrorEquals: ['States.ALL'], MaxAttempts: 2, IntervalSeconds: 5, BackoffRate: 2 }],
                Catch: [{ ErrorEquals: ['States.ALL'], Next: 'LessonFailed', ResultPath: '$.error' }],
                End: true,
              },
              LessonFailed: {
                Type: 'Pass',
                Result: { status: 'FAILED' },
                ResultPath: '$.lessonStatus',
                End: true,
              },
            },
          },
          ResultPath: '$.lessons',
          Next: 'StoreResults',
        },
        StoreResults: {
          Type: 'Task',
          Resource: 'arn:aws:states:::lambda:invoke', // Placeholder: store-results Lambda
          Parameters: {
            'Payload': {
              'curriculumId.$': '$.curriculumId',
              'lessons.$': '$.lessons',
            },
          },
          Next: 'PipelineComplete',
        },
        PipelineComplete: { Type: 'Succeed' },
        PipelineFailed: { Type: 'Fail', Error: 'PipelineError', Cause: 'Curriculum generation pipeline failed' },
      },
    };

    this.stateMachine = new sfn.StateMachine(this, 'CurriculumPipeline', {
      definitionBody: sfn.DefinitionBody.fromString(JSON.stringify(definition)),
      role: pipelineRole,
      timeout: cdk.Duration.minutes(30),
    });

    new cdk.CfnOutput(this, 'StateMachineArn', { value: this.stateMachine.stateMachineArn });
  }
}
