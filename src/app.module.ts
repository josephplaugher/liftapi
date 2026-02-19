import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import EmailService from './service/EmailService';
import LiftController from './controllers/Lift.Controller';
import LiftOptionController from './controllers/LiftOption.Controller';
import AuthController from './controllers/Auth.Controller';
import { AuthMiddleware } from './middleware/Auth';
import { JwtStrategy } from './middleware/JwtStrategy';
import UserService from './service/UserService';
import PaymentController from './controllers/Payment.Controller';
import { StripeService } from './service/StripeService';
import HealthCheck from './controllers/HealthCheck.Controller';
import { WebhookController } from './controllers/Webhook.Controller';
import { json } from 'express';
import PaymentService from './service/PaymentService';
import AppDataSource from './data/AppDataSource';
import LiftService from './service/LiftService';

@Module({
  imports: [TypeOrmModule.forRoot(AppDataSource)],
  controllers: [HealthCheck, AuthController, PaymentController, WebhookController, LiftController, LiftOptionController],
  providers: [EmailService, JwtStrategy, UserService, PaymentService, StripeService, LiftService],
  exports: [JwtStrategy],
})
export class AppModule implements NestModule  { 
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AuthController);
    // preserve raw body, this is for the webhook.controller
    consumer.apply(json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }))
      .forRoutes('*');
  }
}