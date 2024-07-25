import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import EmailService from './service/EmailService';
import LiftController from './controllers/Lift.Controller';
import LiftOptionController from './controllers/LiftOption.Controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [LiftController, LiftOptionController],
  providers: [EmailService],
})
export class AppModule { }