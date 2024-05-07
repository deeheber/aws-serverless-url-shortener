import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb'
import {
  GetCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', event)

  const { requestContext } = event
  const { url } = JSON.parse(event.body || '{}')

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No URL provided' }),
    }
  }

  try {
    const client = new DynamoDBClient({ region: process.env.AWS_REGION })
    const ddbDocClient = DynamoDBDocumentClient.from(client)

    const existingItemParams = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: url,
      },
    }
    const { Item } = await ddbDocClient.send(new GetCommand(existingItemParams))

    if (Item) {
      // The URL already exists in the table
      // Return the short URL
      return {
        body: JSON.stringify({
          shortId: Item.GSI,
          url: `https://${requestContext.domainName}/${requestContext.stage}/${Item.GSI}`,
        }),
        statusCode: 200,
      }
    }

    const counterParams = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: 'CurrentCount',
      },
      UpdateExpression: 'ADD CurrentCount :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
      ReturnValues: ReturnValue.ALL_NEW,
    }

    const { Attributes } = await ddbDocClient.send(
      new UpdateCommand(counterParams),
    )

    if (!Attributes?.CurrentCount) {
      console.error('Error: CurrentCount or Attributes is not defined')
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      }
    }

    const shortId = convertToShortId(Attributes.CurrentCount)

    const putParams = {
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: url,
        GSI: shortId,
      },
    }
    await ddbDocClient.send(new PutCommand(putParams))

    return {
      body: JSON.stringify({
        shortId,
        url: `https://${requestContext.domainName}/${requestContext.stage}/${shortId}`,
      }),
      statusCode: 200,
    }
  } catch (err) {
    console.error('Error:', JSON.stringify(err, null, 2))
    if (err instanceof Error) {
      console.error(`Error message: ${err.message}`)
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}

function convertToShortId(id: number): string {
  // Convert the ID to a base 62 number
  const alphabet =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const base = alphabet.length

  let shortId = ''
  while (id > 0) {
    shortId += alphabet[id % base]
    id = Math.floor(id / base)
  }

  return shortId
}
