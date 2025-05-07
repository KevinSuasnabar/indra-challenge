import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  ScanCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

type DynamoDBItem = { [key: string]: AttributeValue };

export class DynamoDBService {
  private client: DynamoDBClient;
  private tableName: string;

  constructor(tableName: string) {
    this.client = new DynamoDBClient();
    this.tableName = tableName;
  }

  async insert(item: {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status: string;
  }): Promise<any> {
    const record: DynamoDBItem = {
      id: { S: uuidv4() },
      insuredId: { S: item.insuredId },
      scheduleId: { N: item.scheduleId.toString() },
      countryISO: { S: item.countryISO },
      status: { S: item.status },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: record,
    });

    await this.client.send(command);
    return {
      id: record.id.S,
      ...item,
      status: record.status.S,
      createdAt: record.createdAt.S,
      updatedAt: record.updatedAt.S,
    };
  }

  async update(id: string, updates: { status: string }): Promise<any> {
    const record: DynamoDBItem = {
      status: { S: updates.status },
      updatedAt: { S: new Date().toISOString() },
    };

    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: DynamoDBItem = {};

    Object.entries(record).forEach(([key, value]) => {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: { id: { S: id } },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await this.client.send(command);
    return result.Attributes;
  }

  async getAllByInsuredId(insuredId: string): Promise<any[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: {
        ":insuredId": { S: insuredId },
      },
    });

    const result = await this.client.send(command);
    return result.Items || [];
  }
}
