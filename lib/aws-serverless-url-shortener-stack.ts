import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
} from 'aws-cdk-lib/custom-resources'

export class AwsServerlessUrlShortenerStack extends Stack {
  constructor(
    scope: Construct,
    private readonly id: string,
    props?: StackProps,
  ) {
    super(scope, id, props)

    this.buildResources()
  }

  private buildResources() {
    // DynamoDB Table
    const table = new TableV2(this, `${this.id}-table`, {
      globalSecondaryIndexes: [
        {
          indexName: 'GSI',
          partitionKey: { name: 'GSI', type: AttributeType.STRING },
        },
      ],
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: `${this.id}-table`,
    })

    // Init counter item and add to DDB table
    new AwsCustomResource(this, 'initCounter', {
      onCreate: {
        service: 'DynamoDB',
        action: 'putItem',
        parameters: {
          TableName: table.tableName,
          Item: {
            PK: { S: 'CurrentCount' },
            CurrentCount: { N: '10000' },
          },
        },
        physicalResourceId: { id: 'initCounter' },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    })

    // Lambda Functions
    const getFunction = new NodejsFunction(this, `${this.id}-get`, {
      architecture: Architecture.ARM_64,
      description: `Get function for ${this.id} stack`,
      entry: 'src/get.ts',
      functionName: `${this.id}-get`,
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 256,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      environment: { TABLE_NAME: table.tableName },
    })

    const postFunction = new NodejsFunction(this, `${this.id}-post`, {
      architecture: Architecture.ARM_64,
      description: `Post function for ${this.id} stack`,
      entry: 'src/post.ts',
      functionName: `${this.id}-post`,
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 256,
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      environment: { TABLE_NAME: table.tableName },
    })

    // Lambda to DDB Permissions
    table.grantReadData(getFunction)
    table.grantReadWriteData(postFunction)

    // API Gateway
    const api = new RestApi(this, `${this.id}-api`, {
      // TODO uncomment to enable CORS
      // defaultCorsPreflightOptions: {
      //   allowOrigins: ['*'],
      //   allowMethods: ['GET', 'POST'],
      // },
      restApiName: `${this.id}-api`,
    })

    const getIntegration = new LambdaIntegration(getFunction)
    const postIntegration = new LambdaIntegration(postFunction)

    // GET /{shortId}
    const item = api.root.addResource('{shortId}')
    item.addMethod('GET', getIntegration)
    // POST /
    api.root.addMethod('POST', postIntegration)
  }
}
