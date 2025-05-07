import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "appointment",
        cors: true
      },
    },
    {
      http: {
        method: "get",
        path: "appointment/{insuredId}",
        cors: true
      },
    },
    {
      sqs: {
        arn: "${ssm:/infraestructure/${self:provider.stage}/SQSAPPOINTMENT/ARN}",
      },
    },
  ],
};
