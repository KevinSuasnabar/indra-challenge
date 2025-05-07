import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
} from "aws-lambda";
import { execute as httpHandler } from "./http-handler";
import { execute as sqsHandler } from "./sqs-handler";

interface EventHandlerStrategy {
  canHandle(event: any): boolean;
  handle(event: any): Promise<APIGatewayProxyResult | void>;
}

class SQSEventStrategy implements EventHandlerStrategy {
  canHandle(event: any): boolean {
    return event.Records && event.Records[0]?.eventSource === "aws:sqs";
  }

  async handle(event: SQSEvent): Promise<void> {
    return sqsHandler(event);
  }
}

class HTTPEventStrategy implements EventHandlerStrategy {
  canHandle(event: any): boolean {
    return !!event.httpMethod;
  }

  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return httpHandler(event);
  }
}

class EventHandler {
  private strategies: EventHandlerStrategy[];

  constructor() {
    this.strategies = [new SQSEventStrategy(), new HTTPEventStrategy()];
  }

  async handleEvent(event: any): Promise<APIGatewayProxyResult | void> {
    const strategy = this.strategies.find((s) => s.canHandle(event));

    if (!strategy) {
      throw new Error("Tipo de evento no soportado");
    }

    try {
      return await strategy.handle(event);
    } catch (error) {
      console.error("Error handling event:", error);

      if (strategy instanceof SQSEventStrategy) {
        throw error;
      }

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
  }
}

const eventHandler = new EventHandler();

export const routeEvent = async (
  event: any
): Promise<APIGatewayProxyResult | void> => {
  return eventHandler.handleEvent(event);
};

export const main = routeEvent;
