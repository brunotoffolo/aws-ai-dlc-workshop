#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { AgentStack } from '../lib/agent-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();
const env = app.node.tryGetContext('environment') || 'dev';

const dataStack = new DataStack(app, `${env}-DataStack`);
const authStack = new AuthStack(app, `${env}-AuthStack`);

const agentStack = new AgentStack(app, `${env}-AgentStack`, {
  table: dataStack.table,
  contentBucket: dataStack.contentBucket,
});

const pipelineStack = new PipelineStack(app, `${env}-PipelineStack`, {
  table: dataStack.table,
  contentBucket: dataStack.contentBucket,
});

const apiStack = new ApiStack(app, `${env}-ApiStack`, {
  table: dataStack.table,
  contentBucket: dataStack.contentBucket,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  stateMachine: pipelineStack.stateMachine,
});

new FrontendStack(app, `${env}-FrontendStack`, {
  apiUrl: apiStack.api.url,
});
