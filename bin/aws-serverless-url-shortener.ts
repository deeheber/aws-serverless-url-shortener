#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { AwsServerlessUrlShortenerStack } from '../lib/aws-serverless-url-shortener-stack'

const {
  CDK_DEFAULT_ACCOUNT,
  CDK_DEFAULT_REGION,
  AWS_DEFAULT_ACCOUNT_ID,
  AWS_DEFAULT_REGION,
} = process.env

const account = CDK_DEFAULT_ACCOUNT || AWS_DEFAULT_ACCOUNT_ID
const region = CDK_DEFAULT_REGION || AWS_DEFAULT_REGION

const app = new App()

new AwsServerlessUrlShortenerStack(app, 'url-shortener', {
  description: 'The URL shortener stack',
  env: { account, region },
})
