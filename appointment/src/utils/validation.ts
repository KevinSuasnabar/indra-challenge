import { ExecuteRequest } from "../types/execute.types";

export const validateExecuteRequest = (body: string): ExecuteRequest => {
  try {
    const request = JSON.parse(body);
    
    if (!request.insuredId || typeof request.insuredId !== 'string') {
      throw new Error('insuredId is required and must be a string');
    }
    
    if (!request.scheduleId || typeof request.scheduleId !== 'string') {
      throw new Error('scheduleId is required and must be a string');
    }
    
    if (!request.countryISO || typeof request.countryISO !== 'string') {
      throw new Error('countryISO is required and must be a string');
    }

    return request;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in request body');
    }
    throw error;
  }
}; 