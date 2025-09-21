#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Construct } from 'constructs';

export class NoteRiverS3Stack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Create S3 bucket (private)
		const bucket = new s3.Bucket(this, 'MidiBucket', {
			bucketName: 'noteriver.com',
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
		});

		// Create Origin Access Identity for CloudFront
		const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');

		// Grant read permissions to CloudFront
		bucket.grantRead(originAccessIdentity);

		// Create CloudFront Function for URL rewriting
		const midiRewriteFunction = new cloudfront.Function(this, 'MidiRewriteFunction', {
			code: cloudfront.FunctionCode.fromInline(
				readFileSync(join(__dirname, 'cloudfront-functions', 'midi-url-rewrite.js'), 'utf8')
			),
			comment: 'Rewrite MIDI URLs to remove filenames',
			runtime: cloudfront.FunctionRuntime.JS_2_0
		});

		// Create ACM certificate for noteriver.com
		// Note: This must be in us-east-1 for CloudFront
		const certificate = new acm.Certificate(this, 'Certificate', {
			domainName: 'noteriver.com',
			subjectAlternativeNames: ['*.noteriver.com'],
			validation: acm.CertificateValidation.fromDns()
		});

		// Create CloudFront distribution
		const distribution = new cloudfront.Distribution(this, 'NoteriverCDN', {
			defaultBehavior: {
				origin: origins.S3BucketOrigin.withOriginAccessIdentity(bucket, {
					originAccessIdentity
				}),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
				compress: true,
				functionAssociations: [
					{
						function: midiRewriteFunction,
						eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
					}
				]
			},
			domainNames: ['cdn.noteriver.com'],
			certificate
		});

		// Output CloudFront URL
		new cdk.CfnOutput(this, 'DistributionURL', {
			value: `https://${distribution.distributionDomainName}`,
			description: 'CloudFront distribution URL'
		});

		new cdk.CfnOutput(this, 'CustomDomain', {
			value: 'https://cdn.noteriver.com',
			description: 'Custom domain for CDN'
		});

		new cdk.CfnOutput(this, 'CertificateArn', {
			value: certificate.certificateArn,
			description: 'ACM Certificate ARN'
		});
	}
}

const app = new cdk.App();

new NoteRiverS3Stack(app, 'NoteRiverS3Stack', {
	env: {
		region: 'us-east-1', // Must be us-east-1 for CloudFront certificates
		account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID
	}
});
