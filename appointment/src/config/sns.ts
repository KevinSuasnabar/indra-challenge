import { CountryCode } from '../types/sns.types';

export const SNS_TOPIC_ARNS: Record<CountryCode, string | undefined> = {
  CH: process.env.TOPIC_CH_ARN,
  PE: process.env.TOPIC_PE_ARN,
};

export const validateCountryCode = (countryISO: string): CountryCode => {
  const code = countryISO.toUpperCase() as CountryCode;
  if (!SNS_TOPIC_ARNS[code]) {
    throw new Error(`Invalid country code: ${countryISO}`);
  }
  return code;
}; 