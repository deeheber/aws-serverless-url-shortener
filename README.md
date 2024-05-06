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
4. Run `npm run deploy`

### Usage

TODO add docs for the GET and POST endpoints + what they do

### Cleanup

If you want to delete the resources created by this project, run `npm run destroy`. Delete the secret that you created in the Secrets Manager console.
