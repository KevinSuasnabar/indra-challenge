import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "execute",
      },
    },
    {
      sqs: {
        arn: "${ssm:/infraestructure/${self:provider.stage}/SQSAPPOINTMENT/ARN}",
      },
    },
  ],
};
