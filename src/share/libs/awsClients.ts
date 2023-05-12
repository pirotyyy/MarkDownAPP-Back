import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

export class awsClients {
  // ddbClient = new DynamoDBClient({
  //   region: 'localhost',
  //   endpoint: 'http://localhost:8082',
  // });

  ddbClient = new DynamoDBClient({
    region: 'ap-northeast-1',
  });

  s3Client = new S3Client({
    region: 'ap-northeast-1',
  });
}
