import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from "@aws-sdk/client-sns";
import { ExecuteRequest } from "../types/execute.types";
import { SNSPublishResult } from "../types/sns.types";
import { SNS_TOPIC_ARNS, validateCountryCode } from "../config/sns";

export class SNSService {
  private client: SNSClient;

  constructor() {
    this.client = new SNSClient();
  }

  async publishMessage(request: ExecuteRequest): Promise<SNSPublishResult> {
    const countryCode = validateCountryCode(request.countryISO);
    const topicArn = SNS_TOPIC_ARNS[countryCode];

    if (!topicArn) {
      throw new Error(`Topic ARN not found for country: ${countryCode}`);
    }

    const args: PublishCommandInput = {
      Message: JSON.stringify(request),
      TopicArn: topicArn,
    };

    const command = new PublishCommand(args);
    const result = await this.client.send(command);
    return {
      MessageId: result.MessageId,
      SequenceNumber: result.SequenceNumber,
    };
  }
}
