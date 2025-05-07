export interface ExecuteRequest {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  appointmentId?: string;
}

export interface ExecuteResponse {
  message: string;
  input: ExecuteRequest;
  appointmentId: string;
} 