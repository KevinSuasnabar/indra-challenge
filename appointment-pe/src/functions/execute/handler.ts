import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SQSEvent } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import { PostgresService } from "src/services";

const eventBridge = new EventBridgeClient({});

export const execute = async (
  event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> => {
  const postgresService = new PostgresService();
  
  try {
    if ("Records" in event) {
      console.log("SQS Event:", JSON.stringify(event, null, 2));

      for (const record of event.Records) {
        const messageBody = JSON.parse(record.body);
        console.log("Message Body:", JSON.stringify(messageBody, null, 2));

        const appointmentData = JSON.parse(messageBody.Message);
        console.log("Appointment Data:", JSON.stringify(appointmentData, null, 2));

        await postgresService.insert({
          insuredId: appointmentData.insuredId,
          scheduleId: appointmentData.scheduleId
        });

        const params: PutEventsCommandInput = {
          Entries: [
            {
              Source: "appointment-medic",
              DetailType: "appointment-scheduled",
              Detail: JSON.stringify(messageBody),
              EventBusName: "EventBusEBAppointment",
            },
          ],
        };

        const command = new PutEventsCommand(params);
        const result = await eventBridge.send(command);
        console.log("EventBridge Result:", JSON.stringify(result, null, 2));
      }

      return;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Hello from appointment-pe!",
        input: event,
      }),
    };
  } catch (error) {
    console.error("Error processing event:", error);
    throw error;
  } finally {
    await postgresService.close();
  }
};

export const main = execute;
