import { BadRequestException, Body, Catch, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { StripeService } from '../service/StripeService';
import { TCheckoutSessionDto } from 'src/models/CheckoutSessionDto';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';
import UserService from 'src/service/UserService';

@Controller('payment')
export default class PaymentController {
    constructor(private readonly stripeService: StripeService, private readonly userService: UserService) { }

    @Post('session')
    async createSession(@Body() request: { userId: string }) {
        try {
            const user = await AppDataSource.manager.findOne<User>(User, {
                where: { Sub: request.userId }
            });
            if (!user) throw new BadRequestException;

            const session = await this.stripeService.createCheckoutSession({
                priceId: "price_1SlvvoBXnHMHbjftxgkqhN0e",
                auth0Sub: request.userId,
                quantity: 1,
                successUrl: `${process.env.CLIENT_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.CLIENT_URL}?payment=cancel`,
            });

            await AppDataSource.manager.save(user);

            return { sessionId: session.id, url: session.url };
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
