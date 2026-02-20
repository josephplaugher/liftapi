import { Injectable, RawBodyRequest, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import User from 'src/models/User';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor(@InjectDataSource() private readonly appDataSource: DataSource) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
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

    async handleWebhook(signature: string, @Req() request: RawBodyRequest<Request>) {
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
            throw new Error('Webhook signature verification failed');
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.handleCheckoutComplete(session);
                break;

            case 'customer.subscription.updated':
                const sub = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionUpdated(sub);
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

    private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: session.client_reference_id?.toString() }
        });

        if (!user) throw new Error("cannot find user to update subscription status");

        const subscription = await this.stripe.subscriptions.retrieve(
            session.subscription as string
        );

        user.StripeCustomerId = session.customer as string;
        user.StripeSubscriptionId = session.subscription as string;
        user.StripePaymentStatus = session.payment_status as string;
        user.StripePriceId = subscription.items.data[0].price.id;
        user.StripeTrialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
        user.StripePaymentStatus = subscription.status;
        user.StripeCancelAtPeriodEnd = subscription.cancel_at_period_end;
        await this.appDataSource.manager.save(user);
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { StripeCustomerId: subscription.customer as string }
        });
        if (!user) throw new Error("cannot find user to update price");

        user.StripeSubscriptionId = subscription.id as string;
        user.StripePriceId = subscription.items.data[0].price.id.toString();
        user.StripeTrialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
        await this.appDataSource.manager.save(user);
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { StripeCustomerId: customerId }
        });
        if (!user) throw new Error("cannot find user to delete");

        user.StripeSubscriptionId = "";
        user.StripePriceId = "";
        user.StripeTrialEnd = null;
        user.StripeCurrentPeriodEnd = null;
        await this.appDataSource.manager.save(user);
    }
}
