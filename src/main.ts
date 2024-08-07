import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "reflect-metadata";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "allowedHeaders": "*",
    "allowOrigin": "any"
  }
  app.enableCors(options);
  app.setGlobalPrefix('api');
  await app.listen(process.env.API_PORT_DEV!);
  // await app.listen(process.env.NODE_ENV == "development" ? process.env.API_PORT_DEV! : process.env.API_PORT_PROD!);
}
bootstrap();
