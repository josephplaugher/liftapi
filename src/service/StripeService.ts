import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-12-15.clover',
        });
    }

    async createCheckoutSession(params: {
        priceId: string;
        quantity?: number;
        successUrl: string;
        cancelUrl: string;
        customerEmail?: string;
        metadata?: Record<string, string>;
        auth0Sub?: string;
    }) {
        return this.stripe.checkout.sessions.create({
            mode: 'subscription',
            client_reference_id: params.auth0Sub,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: params.quantity ?? 1,
                },
            ],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            customer_email: params.customerEmail,
            metadata: params.metadata,
        });
    }
}
