import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'node:path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class FileProcessorInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamodb = new Table(this, 'customersTable', {
      tableName: 'customers_info',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'firstName',
        type: AttributeType.STRING
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const lambda = new NodejsFunction(this, 'file-processor-function', {
      runtime: Runtime.NODEJS_18_X,
      entry: path.resolve(__dirname, '../../file-processor-app/src/index.ts'),
      handler: 'handlerFunc',
      functionName: 'csv-file-processor',
      logRetention: RetentionDays.ONE_DAY,
      environment: {
        'TABLE_NAME': dynamodb.tableName
      }
    });

    const bucket = new Bucket(this, 'csv-input-bucket', {
      bucketName: 'csv-input-data-bucket',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    bucket.grantRead(lambda);
    bucket.addObjectCreatedNotification(new LambdaDestination(lambda), {
      suffix: '.csv',
    });

    dynamodb.grantReadWriteData(lambda);
  }
}
