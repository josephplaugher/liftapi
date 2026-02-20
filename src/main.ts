import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";
import * as fs from 'fs'
import * as path from 'path'
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    rawBody: true
    // httpsOptions: {
    //   key: fs.readFileSync(path.join(__dirname, '../../../ssl/dev-key.pem')),
    //   cert: fs.readFileSync(path.join(__dirname, '../../../ssl/dev-cert.pem')),
    // },
  })
  const options = {
    methods: "OPTIONS, GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: true,//process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders:['Content-Type', 'Authorization'],
  }
  app.use('/webhook', raw({ type: 'application/json' }));
  app.enableCors(options);
  app.setGlobalPrefix('api');
  const port = process.env.API_PORT_PROD!;
  await app.listen(port);
  console.log(`app listening on port ${port}`)
}
bootstrap();
