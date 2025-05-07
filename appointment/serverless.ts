import type { AWS } from "@serverless/typescript";
import execute from "@functions/execute";

const serverlessConfiguration: AWS = {
  service: "appointment",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-auto-swagger"],
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
      TOPIC_PE_ARN:
        "${ssm:/infraestructure/${self:provider.stage}/sns/TOPICPE}",
      TOPIC_CH_ARN:
        "${ssm:/infraestructure/${self:provider.stage}/sns/TOPICCH}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["sns:Publish"],
            Resource: "arn:aws:sns:*:*:*",
          },
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: "*",
          },
        ],
      },
    },
  },
  functions: { execute },
  package: { 
    individually: true,
    patterns: [
      "!node_modules/**",
      "!src/**",
      "src/functions/**",
      "swagger.json"
    ]
  },
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
    autoswagger: {
      apiType: 'http',
      basePath: '/${self:provider.stage}',
      schemes: ['https'],
      title: 'Appointment API',
      swaggerFiles: ['swagger.json'],
      swaggerPath: 'swagger',
      swaggerUiPath: 'swagger-ui',
      swaggerUiOptions: {
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true
      }
    }
  },
};

module.exports = serverlessConfiguration;
