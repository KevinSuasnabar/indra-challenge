import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "infraestructure",
  frameworkVersion: "3",
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
    },
  },
  // import the function via paths
  package: { individually: true },
  resources: {
    Resources: {
      SQSPE: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "SQSPE-${self:provider.stage}",
        },
      },
      SNSTOPICPE: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "SNSTOPICPE-${self:provider.stage}",
          Subscription: [
            {
              Protocol: "sqs",
              Endpoint: { "Fn::GetAtt": ["SQSPE", "Arn"] },
            },
          ],
        },
      },
      SQSQUEUEPOLICYPE: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "SQSPE" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["SQSPE", "Arn"] },
                Principal: "*",
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "SNSTOPICPE" },
                  },
                },
              },
            ],
          },
        },
      },

      SSMTOPICPE: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/sns/TOPICPE",
          Type: "String",
          Value: { Ref: "SNSTOPICPE" },
        },
      },
      SSMSQSPEARN: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSPE/ARN",
          Type: "String",
          Value: { "Fn::GetAtt": ["SQSPE", "Arn"] },
        },
      },
      SSMSQSPEURL: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSPE/URL",
          Type: "String",
          Value: { Ref: "SQSPE" },
        },
      },

      SQSCH: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "SQSCH-${self:provider.stage}",
        },
      },
      SNSTOPICCH: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "SNSTOPICCH-${self:provider.stage}",
          Subscription: [
            {
              Protocol: "sqs",
              Endpoint: { "Fn::GetAtt": ["SQSCH", "Arn"] },
            },
          ],
        },
      },
      SQSQUEUEPOLICICH: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "SQSCH" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["SQSCH", "Arn"] },
                Principal: "*",
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "SNSTOPICCH" },
                  },
                },
              },
            ],
          },
        },
      },

      SSMTOPICCH: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/sns/TOPICCH",
          Type: "String",
          Value: { Ref: "SNSTOPICCH" },
        },
      },
      SSMSQSCHARN: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSCH/ARN",
          Type: "String",
          Value: { "Fn::GetAtt": ["SQSCH", "Arn"] },
        },
      },
      SSMSQSCHURL: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSCH/URL",
          Type: "String",
          Value: { Ref: "SQSCH" },
        },
      },

      SQSAPPOINTMENT: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "SQSAPPOINTMENT-${self:provider.stage}",
        },
      },
      EventBusEBAppointment: {
        Type: "AWS::Events::EventBus",
        Properties: {
          Name: "EventBusEBAppointment",
        },
      },
      EventRuleEBAppointment: {
        Type: "AWS::Events::Rule",
        Properties: {
          EventBusName: { "Fn::GetAtt": ["EventBusEBAppointment", "Name"] },
          EventPattern: {
            source: ["appointment-medic"],
            "detail-type": ["appointment-scheduled"],
          },
          Targets: [
            {
              Id: "SQSEB",
              Arn: { "Fn::GetAtt": ["SQSAPPOINTMENT", "Arn"] },
            },
          ],
        },
      },
      EventBridgePermissionAppointment: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["SQSAPPOINTMENT", "Arn"] },
                Principal: "*",
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": {
                      "Fn::GetAtt": ["EventRuleEBAppointment", "Arn"],
                    },
                  },
                },
              },
            ],
          },
          Queues: [{ Ref: "SQSAPPOINTMENT" }],
        },
      },

      SSMSQSAPPOINTMENTARN: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSAPPOINTMENT/ARN",
          Type: "String",
          Value: { "Fn::GetAtt": ["SQSAPPOINTMENT", "Arn"] },
        },
      },
      SSMSQSAPPOINTMENTURL: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/infraestructure/${self:provider.stage}/SQSAPPOINTMENT/URL",
          Type: "String",
          Value: { Ref: "SQSAPPOINTMENT" },
        },
      },

      DynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Appointment",
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
