import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { awsClients } from 'src/share/libs/awsClients';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  s3Client = new awsClients().s3Client;
  private readonly imagesBucketName = process.env.IMAGES_BUCKET_NAME;

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const key = `${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.imagesBucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return `https://${this.imagesBucketName}.s3.amazonaws.com/${key}`;
  }
}
