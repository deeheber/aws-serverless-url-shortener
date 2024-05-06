import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement the get function
  return {
    body: JSON.stringify({ message: 'Hello from the get function!' }),
    statusCode: 200,
  }
}