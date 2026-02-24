import { Controller, Post, Headers, RawBodyRequest, Req, HttpCode, Body } from '@nestjs/common';
import { Request } from 'express';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';
import { StripeService } from 'src/service/StripeService';
import Stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly stripeService: StripeService,
    ) { }


    @Post()
    @HttpCode(200)
    async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: RawBodyRequest<Request>) {
        try {
            const r = await this.stripeService.handleWebhook(signature, request)
        } catch (err) {
            console.log(err);
        }
    }
}