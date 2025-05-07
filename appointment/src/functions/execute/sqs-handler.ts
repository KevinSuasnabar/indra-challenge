import { SQSEvent } from "aws-lambda";

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

        console.log("Message from SQS:", record.body);
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
