import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface AgentStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  contentBucket: s3.Bucket;
}

/**
 * Defines AgentCore agent roles and permissions.
 * Actual AgentCore agent resources should be created via AgentCore console/CLI
 * and referenced here for IAM wiring. Replace CfnOutput placeholders with
 * real agent ARNs once AgentCore CDK constructs are available.
 */
export class AgentStack extends cdk.Stack {
  public readonly researchAgentRole: iam.Role;
  public readonly contentAgentRole: iam.Role;
  public readonly assessmentAgentRole: iam.Role;
  public readonly personalisationAgentRole: iam.Role;

  constructor(scope: Construct, id: string, props: AgentStackProps) {
    super(scope, id, props);

    const bedrockPolicy = new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['*'],
    });

    // Research Agent — Bedrock + web search
    this.researchAgentRole = new iam.Role(this, 'ResearchAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });
    this.researchAgentRole.addToPolicy(bedrockPolicy);

    // Content Agent — Bedrock + S3 write
    this.contentAgentRole = new iam.Role(this, 'ContentAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });
    this.contentAgentRole.addToPolicy(bedrockPolicy);
    props.contentBucket.grantWrite(this.contentAgentRole);

    // Assessment Agent — Bedrock + DynamoDB read
    this.assessmentAgentRole = new iam.Role(this, 'AssessmentAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });
    this.assessmentAgentRole.addToPolicy(bedrockPolicy);
    props.table.grantReadData(this.assessmentAgentRole);

    // Personalisation Agent — Bedrock + DynamoDB read/write + AgentCore memory
    this.personalisationAgentRole = new iam.Role(this, 'PersonalisationAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });
    this.personalisationAgentRole.addToPolicy(bedrockPolicy);
    props.table.grantReadWriteData(this.personalisationAgentRole);

    new cdk.CfnOutput(this, 'ResearchAgentRoleArn', { value: this.researchAgentRole.roleArn });
    new cdk.CfnOutput(this, 'ContentAgentRoleArn', { value: this.contentAgentRole.roleArn });
    new cdk.CfnOutput(this, 'AssessmentAgentRoleArn', { value: this.assessmentAgentRole.roleArn });
    new cdk.CfnOutput(this, 'PersonalisationAgentRoleArn', { value: this.personalisationAgentRole.roleArn });
  }
}
