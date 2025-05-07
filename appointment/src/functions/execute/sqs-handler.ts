import { SQSEvent } from "aws-lambda";
import { DynamoDBService } from "../../services";
import { ExecuteRequest } from "../../types/execute.types";
import { Status } from "../../utils";

const dynamoService = new DynamoDBService("Appointment");

class SQSProcessingError extends Error {
  constructor(message: string, public readonly record?: any) {
    super(message);
    this.name = "SQSProcessingError";
  }
}

export const execute = async (event: SQSEvent): Promise<void> => {
  try {
    if (!event.Records || event.Records.length === 0) {
      throw new SQSProcessingError("No records found in SQS event");
    }

    console.log("Processing SQS event:", JSON.stringify(event));

    for (const record of event.Records) {
      try {
        if (!record.body) {
          throw new SQSProcessingError("Empty message body", record);
        }

        const snsEvent = JSON.parse(record.body);
        if (!snsEvent.detail?.Message) {
          throw new SQSProcessingError("No Message found in SNS event", record);
        }

        const message = JSON.parse(snsEvent.detail.Message) as ExecuteRequest;
        console.log("Processing message:", message);

        if (!message.appointmentId) {
          throw new SQSProcessingError(
            "appointmentId is required in message",
            record
          );
        }

        const updatedAppointment = await dynamoService.update(
          message.appointmentId,
          {
            status: Status.COMPLETED,
          }
        );
        console.log("Updated appointment in DynamoDB:", updatedAppointment);
      } catch (recordError) {
        console.error(
          `Error processing record ${record.messageId}:`,
          recordError
        );
      }
    }
  } catch (error) {
    console.error("Error processing SQS event:", {
      error: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const main = execute;
