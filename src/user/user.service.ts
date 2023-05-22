import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import {
  ConditionalCheckFailedException,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { awsClients } from 'src/share/libs/awsClients';
import { User } from 'src/share/models/user.model';
import { UserFormatter } from './formatter/user.formatter';
import { Msg } from 'src/share/interfaces/Msg.interface';

@Injectable()
export class UserService {
  private readonly tableName = process.env.TABLE_NAME;
  private readonly ddbClient = new awsClients().ddbClient;
  private readonly s3Client = new awsClients().s3Client;

  async create(dto: CreateUserDto): Promise<Msg> {
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: { S: `@${dto.userId}` },
        SK: { S: 'user' },
        Username: { S: dto.username },
        HashedPassword: { S: hashedPassword },
        Email: { S: dto.email },
        ProfileImage: { S: dto.profileImg },
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    };

    try {
      await this.ddbClient.send(new PutItemCommand(params));

      return {
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestException(
          'このユーザーIDはすでに使用されています。',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getById(userId: string): Promise<User> {
    const params: GetItemCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: { S: `@${userId}` },
        SK: { S: 'user' },
      },
    };

    try {
      const result = await this.ddbClient.send(new GetItemCommand(params));
      const user = UserFormatter(result.Item);

      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
