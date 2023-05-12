import {
  DeleteObjectCommand,
  GetObjectAclCommand,
  GetObjectAclCommandInput,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { awsClients } from 'src/share/libs/awsClients';
import { v4 as uuidv4 } from 'uuid';
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { SaveFileDto } from './dto/save-mdFile.dto';
import { MdInfoFormatter } from './formatter/md-info.formatter';
import { UpdateMdDto } from './dto/update-md.dto';
import { Msg } from 'src/share/interfaces/Msg.interface';
import { MdInfo } from 'src/share/models/mdInfo.model';
import { Md } from 'src/share/models/md.model';

@Injectable()
export class MdService {
  s3Client = new awsClients().s3Client;
  ddbClient = new awsClients().ddbClient;
  private readonly mainBucketName = process.env.MAIN_BUCKET_NAME;
  private readonly tableName = process.env.TABLE_NAME;

  async saveMd(saveFileDto: SaveFileDto): Promise<void> {
    const fileId = uuidv4();

    try {
      await this.saveInfoToDdb(fileId, saveFileDto.title, saveFileDto.userId);
      await this.uploadFileToS3(
        saveFileDto.userId,
        fileId,
        saveFileDto.content,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async uploadFileToS3(
    userId: string,
    fileId: string,
    content: string,
  ): Promise<void> {
    const params = {
      Bucket: this.mainBucketName,
      Key: `${userId}/${fileId}.txt`,
      Body: content,
    };

    const command = new PutObjectCommand(params);

    try {
      await this.s3Client.send(command);
      console.log(`File uploaded successfully`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async saveInfoToDdb(
    fileId: string,
    title: string,
    userId: string,
  ): Promise<Msg> {
    const now = Date.now();
    const mdId = uuidv4();
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `MD#${mdId}` },
        SK: { S: 'md' },
        Data: { S: `@${userId}` },
        Title: { S: title },
        FileId: { S: fileId },
        CreatedAt: { N: now.toString() },
      },
    };

    try {
      await this.ddbClient.send(new PutItemCommand(params));

      return {
        message: 'Mdfile saved successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMd(mdId: string): Promise<Md> {
    try {
      const fileInfo = await this.getMdInfo(mdId);
      const fileData = await this.getMdFile(fileInfo.fileId, fileInfo.userId);

      return {
        ...fileInfo,
        content: fileData,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMdFile(fileId: string, userId: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.mainBucketName,
      Key: `${userId}/${fileId}.txt`,
    });

    try {
      const response = await this.s3Client.send(command);

      const str = await response.Body.transformToString();
      return str;
    } catch (error) {}
  }

  async getMdInfo(mdId: string): Promise<MdInfo> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `MD#${mdId}` },
        SK: { S: 'md' },
      },
    };

    try {
      const result = await this.ddbClient.send(new GetItemCommand(params));

      const mdInfo = MdInfoFormatter(result.Item);

      return mdInfo;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllMdInfo(): Promise<MdInfo[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-PK-index',
      KeyConditionExpression: 'begins_with(#PK, :pk) and #SK= :sk',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': { S: 'MD#' },
        ':sk': { S: 'md' },
      },
    };

    try {
      const response = await this.ddbClient.send(new QueryCommand(params));

      const mdInfos = response.Items.map((info) => {
        return MdInfoFormatter(info);
      });

      mdInfos.sort((a: any, b: any) => {
        const dateA = Date.parse(a.createdAt);
        const dateB = Date.parse(b.createdAt);
        return dateB - dateA;
      });

      return mdInfos;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMdInfoByUserId(userId: string): Promise<MdInfo[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'SK-Data-index',
      KeyConditionExpression: '#SK = :sk and #Data = :data',
      ExpressionAttributeNames: {
        '#SK': 'SK',
        '#Data': 'Data',
      },
      ExpressionAttributeValues: {
        ':sk': { S: 'md' },
        ':data': { S: `@${userId}` },
      },
    };

    try {
      const response = await this.ddbClient.send(new QueryCommand(params));

      const mdInfos = response.Items.map((info) => {
        return MdInfoFormatter(info);
      });

      return mdInfos;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteMd(mdId: string): Promise<void> {
    try {
      const mdInfo = await this.getMdInfo(mdId);
      await this.deleteMdFile(mdInfo.fileId, mdInfo.userId);
      await this.deleteMdInfo(mdId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteMdInfo(mdId: string): Promise<void> {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `MD#${mdId}` },
        SK: { S: 'md' },
      },
    };

    try {
      await this.ddbClient.send(new DeleteItemCommand(params));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteMdFile(fileId: string, userId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.mainBucketName,
      Key: `${userId}/${fileId}.txt`,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateMd(mdId: string, dto: UpdateMdDto): Promise<void> {
    try {
      const mdInfo = await this.getMdInfo(mdId);

      const saveMdDto: SaveFileDto = {
        userId: mdInfo.userId,
        title: dto.title,
        content: dto.content,
      };

      await this.deleteMd(mdId);
      await this.saveMd(saveMdDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
