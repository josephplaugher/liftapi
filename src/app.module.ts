import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EmailService from './service/EmailService';
import LiftController from './controllers/Lift.Controller';
import LiftOptionController from './controllers/LiftOption.Controller';
import AuthController from './controllers/Auth.Controller';
import { AuthMiddleware } from './middleware/Auth';
import { JwtStrategy } from './middleware/JwtStrategy';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AuthController, LiftController, LiftOptionController],
  providers: [EmailService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AppModule { 
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AuthController);
  }
}