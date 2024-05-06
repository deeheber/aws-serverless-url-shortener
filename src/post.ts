import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement the post function
  return {
    body: JSON.stringify({ message: 'Hello from the post function!' }),
    statusCode: 200,
  }
}