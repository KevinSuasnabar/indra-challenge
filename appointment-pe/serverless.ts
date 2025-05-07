import type { AWS } from "@serverless/typescript";

import execute from "@functions/execute";

const serverlessConfiguration: AWS = {
  service: "appointment-pe",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    stage: "${opt:stage, 'dev'}",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      DB_HOST: "${ssm:/infraestructure/${self:provider.stage}/PEDATABASE/HOST}",
      DB_PORT: "5432",
      DB_NAME: "appointment",
      DB_USER: "postgres",
      DB_PASSWORD: "${ssm:/infraestructure/${self:provider.stage}/PEDATABASE/PASSWORD}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "events:PutEvents",
            Resource: "*",
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { execute },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
