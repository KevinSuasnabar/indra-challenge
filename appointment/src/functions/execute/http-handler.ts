import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SNSService } from "../../services";
import { DynamoDBService } from "../../services";
import { validateExecuteRequest } from "../../utils";
import { ExecuteResponse } from "../../types/execute.types";
import { Status } from "../../utils";
const snsService = new SNSService();
const dynamoService = new DynamoDBService("Appointment");

export const execute = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }

    const request = validateExecuteRequest(event.body);
    console.log("Processing request:", request);

    const appointment = await dynamoService.insert({
      insuredId: request.insuredId,
      scheduleId: request.scheduleId,
      countryISO: request.countryISO,
      status: Status.PENDING,
    });
    console.log("Saved to DynamoDB:", appointment);

    const result = await snsService.publishMessage({
      ...request,
      appointmentId: appointment.id,
    });
    console.log("SNS publish result:", result);

    const response: ExecuteResponse = {
      message: "Request processed successfully",
      input: request,
      appointmentId: appointment.id,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    const statusCode =
      error instanceof Error && error.message.includes("Invalid") ? 400 : 500;

    return {
      statusCode,
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};

export const main = execute;
