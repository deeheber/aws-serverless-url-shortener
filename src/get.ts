import { APIGatewayProxyEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  QueryCommand,
  DynamoDBDocumentClient,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb'

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Event:', event)

  try {
    const shortId = event.pathParameters?.shortId
    if (!shortId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No Short ID provided' }),
      }
    }

    const client = new DynamoDBClient({ region: process.env.AWS_REGION })
    const ddbDocClient = DynamoDBDocumentClient.from(client)

    const params: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
      IndexName: 'GSI',
      KeyConditionExpression: 'GSI = :shortId',
      ExpressionAttributeValues: {
        ':shortId': shortId,
      },
    }

    const { Items } = await ddbDocClient.send(new QueryCommand(params))
    if (!Items || Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Short ID: ${shortId} not found` }),
      }
    }

    console.log('Items found: ', JSON.stringify(Items, null, 2))

    const { PK } = Items[0]
    if (!PK) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Short ID: ${shortId} not found` }),
      }
    }

    return {
      statusCode: 301,
      headers: {
        Location: PK,
      },
    }
  } catch (err) {
    console.error('Error:', JSON.stringify(err, null, 2))
    if (err instanceof Error) {
      console.error(`Error message: ${err.message}`)
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
