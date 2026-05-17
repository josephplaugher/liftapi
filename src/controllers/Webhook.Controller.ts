import { Controller, Post, Headers, RawBodyRequest, Req, HttpCode, Body, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';
import { StripeService } from 'src/service/StripeService';
import Stripe from 'stripe';
import * as Sentry from "@sentry/nestjs"

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly stripeService: StripeService,
    ) { }


    @Post()
    @HttpCode(200)
    async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: RawBodyRequest<Request>) {
        try {
            await this.stripeService.handleWebhook(signature, request)
        } catch (err) {
            Sentry.captureException(err);
            return new BadRequestException("error handling webhook");
        }
    }
}