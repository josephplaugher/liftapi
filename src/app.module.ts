import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EmailService from './service/EmailService';
import LiftController from './controllers/Lift.Controller';
import LiftOptionController from './controllers/LiftOption.Controller';
import AuthController from './controllers/Auth.Controller';
import { AuthMiddleware } from './middleware/Auth';
import { JwtStrategy } from './middleware/JwtStrategy';
import UserIdService from './service/UserIdService';
import PaymentController from './controllers/Payment.Controller';
import { StripeService } from './service/StripeService';
import HealthCheck from './controllers/HealthCheck.Controller';
import { WebhookController } from './controllers/Webhook.Controller';
import { json } from 'express';
// import AppDataSource from './data/AppDataSource';
// import { DbContext } from './data/DbContext';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [HealthCheck, AuthController, PaymentController, WebhookController, LiftController, LiftOptionController],
  providers: [EmailService, JwtStrategy, UserIdService, StripeService],
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