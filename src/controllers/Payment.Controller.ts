import { BadRequestException, Body, Catch, Controller, Post, Req } from '@nestjs/common';
import { StripeService } from '../service/StripeService';
import { TCheckoutSessionDto } from 'src/models/CheckoutSessionDto';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';

@Controller('payment')
export default class PaymentController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('session')
    async createSession(@Body() request: { userId: string }) {
        try {
            const user = await AppDataSource.manager.findOne<User>(User, {
                where: { Sub: request.userId }
            });
            if(!user) throw new BadRequestException;

            const session = await this.stripeService.createCheckoutSession({
                priceId: "price_1SrL9PPXvt4RqC11noWLuTex",
                auth0Sub: request.userId,
                metadata: {
                    auth0Id: request.userId, // auth0 sub
                },
                quantity: 1,
                successUrl: `${process.env.CLIENT_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}',`,
                cancelUrl: `${process.env.CLIENT_URL}?payment=cancel`,
            });

            user.LastStripeSessionId = session.id;
            await AppDataSource.manager.save(user);

            return { sessionId: session.id, url: session.url };
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }
}
