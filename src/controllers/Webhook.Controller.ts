// webhook.controller.ts
import { Controller, Post, Headers, RawBodyRequest, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import AppDataSource from 'src/data/AppDataSource';
import User from 'src/models/User';
import Stripe from 'stripe';

interface RequestWithRawBody extends Request {
    rawBody: Buffer;
}

@Controller('webhook')
export class WebhookController {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2025-12-15.clover',
        });
    }

    @Post()
    @HttpCode(200)
    async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: RawBodyRequest<Request>) {
        console.log("stripe webhook is firing")
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
        let event: Stripe.Event;

        try {
            const payload = request.rawBody as unknown as Buffer
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret,
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            throw new Error('Webhook signature verification failed');
        }

        // Handle the event
        switch (event.type) {
            case 'customer.created':
                const customer = event.data.object as Stripe.Customer;

                await this.handleCustomerCreated(customer)
                break;
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.handleCheckoutComplete(session);
                break;

            case 'charge.succeeded':
            case 'invoice.paid':
                const invoice = event.data.object as Stripe.Invoice;
                await this.handleSubscriptionPaid(invoice);
                break;

            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionDeleted(subscription);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }
    
    private async handleCustomerCreated(customer: Stripe.Customer) {
        const customerId = customer.metadata.auth0Id;
        const user = await AppDataSource.manager.findOne<User>(User, {
            where: { Sub: customerId }
        });
        if (!user) throw new Error("cannot find user to update subscription status");

        user.StripeSubscriptionId = customer.id;
        await AppDataSource.manager.save(user);
    }

    private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const user = await AppDataSource.manager.findOne<User>(User, {
            where: { StripeCustomerId: customerId }
        });
        if (!user) throw new Error("cannot find user to update subscription status");

        user.StripeSubscriptionId = subscriptionId;
        await AppDataSource.manager.save(user);
    }

    private async handleSubscriptionPaid(invoice: Stripe.Invoice) {
        const customerId = invoice.customer as string;
        const user = await AppDataSource.manager.findOne<User>(User, {
            where: { StripeCustomerId: customerId }
        });
        if (!user) throw new Error("cannot find user to update payment status");

        user.StripeSubscriptionStatus = true;
        await AppDataSource.manager.save(user);
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;
        const user = await AppDataSource.manager.findOne<User>(User, {
            where: { StripeCustomerId: customerId }
        });
        if (!user) throw new Error("cannot find user to update subscription status");

        user.StripeSubscriptionStatus = false;
        user.StripeSubscriptionId = "";
        await AppDataSource.manager.save(user);
    }
}