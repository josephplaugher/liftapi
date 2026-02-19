import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StripeService } from '../service/StripeService';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';
import UserService from 'src/service/UserService';
import PaymentService from 'src/service/PaymentService';

@Controller('payment')
export default class PaymentController {
    constructor(
        private readonly userService: UserService,
        private readonly paymentService: PaymentService
    ) { }

    @Post('session')
    async createSession(@Body() request: { userId: string }) {
        try {
            const session = await this.paymentService.checkoutSession(request.userId)
            return session;
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }

    @Get('status')
    async handleStatus(@Query('sub') sub: string) {
        try {
            const status = await this.userService.verifyPaymentStatus(sub);
            return { status };
        } catch (Error: any) {
            return BadRequestException;
        }
    }
}
