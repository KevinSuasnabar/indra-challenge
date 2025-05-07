import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SNSService } from '../../services';
import { validateExecuteRequest } from '../../utils';
import { ExecuteResponse } from '../../types/execute.types';

const snsService = new SNSService();

export const execute = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const request = validateExecuteRequest(event.body);
    console.log('Processing request:', request);

    const result = await snsService.publishMessage(request);
    console.log('SNS publish result:', result);

    const response: ExecuteResponse = {
      message: 'Request processed successfully',
      input: request,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    const statusCode = error instanceof Error && error.message.includes('Invalid') ? 400 : 500;
    
    return {
      statusCode,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

export const main = execute; 