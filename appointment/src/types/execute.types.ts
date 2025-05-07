export interface ExecuteRequest {
  insuredId: string;
  scheduleId: string;
  countryISO: string;
}

export interface ExecuteResponse {
  message: string;
  input: ExecuteRequest;
} 