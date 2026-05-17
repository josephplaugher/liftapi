import './middleware/Instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";
import * as fs from 'fs'
import * as path from 'path'
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    rawBody: true
  })
  const options = {
    methods: "OPTIONS, GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: true,
    credentials: true,
    allowedHeaders:['Content-Type', 'Authorization'],
  }
  app.use('/webhook', raw({ type: 'application/json' }));
  app.enableCors(options);
  app.setGlobalPrefix('api');
  const port = process.env.NODE_ENV == "production" ? process.env.API_PORT_PROD! : process.env.API_PORT_DEV!;
  await app.listen(port);
  console.log(`app running in ${process.env.NODE_ENV} listening on port ${port}`)
}
bootstrap();
