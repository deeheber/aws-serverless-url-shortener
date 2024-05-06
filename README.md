# AWS Serverless URL Shortener

This repo contains the AWS cloud resource definitions and code needed to create an AWS Serverless version of the classic system design interview question: design a URL shortener.

## Technologies Used

- [Amazon API Gateway](https://aws.amazon.com/api-gateway/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
- [NodeJS](https://nodejs.org/en)

### Architecture Diagram

![URL shortener diagram](./docs/url-shortener-diagram.png)

## Instructions To Run

### Prerequisites

1. Install Node.js
2. Ensure you have an AWS account, install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), and [configure your credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

### Steps To Run

1. Clone the repo
2. Run `npm install`
3. Run `export AWS_PROFILE=<your_aws_profile>`
   - Optional if you have a default profile or use `--profile` instead
4. Run `npm run deploy` and take note of the output API URL

### Usage

### API Gateway

Get the URL for your API Gateway from the console output post deploy or from the CloudFormation stack outputs.

**Note:** If using this in the "real world", we'd ideally want to map the API Gateway to a custom domain name to actually make this a shorter URL so the shortcut makes more sense.

There are two endpoints you can interact with using something like [curl](https://curl.se/) or [Postman](https://www.postman.com/)

1. POST <URL>

This endpoint is used to create a new shortened URL. In the Body.url feed it the URL you'd like to shorten. This includes the http/https part of the URL.

It will return the shortened version of the URL.

2. GET <URL>/{shortId}

This endpoint is used to redirect a shortned URL to the long URL.

If it does not exist in the DynamoDB table, a 404 error will be returned.

### DynamoDB

TODO add into about DDB main table + GSI schema

### Cleanup

If you want to delete the resources created by this project, run `npm run destroy`.

Everything in this stack is considered Serverless, so unless you have a lot of usage and/or content in the DynamoDB table this will likely remain in the AWS free tier.
