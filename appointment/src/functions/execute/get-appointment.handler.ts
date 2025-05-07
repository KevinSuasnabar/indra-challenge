import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBService } from "src/services";

interface AppointmentResponse {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const transformDynamoItem = (item: any): AppointmentResponse => {
  return {
    id: item.id.S,
    insuredId: item.insuredId.S,
    scheduleId: parseInt(item.scheduleId.N),
    countryISO: item.countryISO.S,
    status: item.status.S,
    createdAt: item.createdAt.S,
    updatedAt: item.updatedAt.S
  };
};

export const execute = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamoService = new DynamoDBService("Appointment");
  const insuredId = event.pathParameters?.insuredId;

  if (!insuredId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "insuredId is required",
      }),
    };
  }

  try {
    const appointments = await dynamoService.getAllByInsuredId(insuredId);
    const transformedAppointments = appointments.map(transformDynamoItem);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: transformedAppointments.length === 0 
          ? `No appointments found for insuredId: ${insuredId}`
          : "Appointments retrieved successfully",
        data: transformedAppointments
      })
    };
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving appointments",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}; 