import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { Handler, Context } from 'aws-lambda';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: Server;

const bootstrapServer = async (): Promise<Server> => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://mark-down-app-front.vercel.app'],
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return createServer(app.getHttpAdapter().getInstance());
};

export const handler: Handler = async (event: any, context: Context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
