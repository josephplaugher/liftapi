import { Injectable } from "@nestjs/common";
import User from "src/models/User";
import { StripeService } from "./StripeService";
import { InjectDataSource } from "@nestjs/typeorm/dist/common";
import { DataSource } from "typeorm";

@Injectable()
export default class PaymentService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource, private readonly stripeService: StripeService) { }

    async checkoutSession(userId: string ) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: userId }
        });
        if (!user) {
            throw new Error(`can't find user by Sub ${userId} to complete payment session`);
        }
        const session = await this.stripeService.createCheckoutSession({
            priceId: process.env.PRICE_ID!,
            auth0Sub: userId,
            quantity: 1,
            successUrl: `${process.env.CLIENT_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.CLIENT_URL}?payment=cancel`,
        });

        await this.appDataSource.manager.save(user);

        return { sessionId: session.id, url: session.url };
    }

    async cancelSubscription(userId: string, cancelReason?: string) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: userId }
        });
        if (!user) {
            throw new Error(`can't find user by Sub ${userId} to cancel subscription`);
        }
        if (!user.StripeSubscriptionId) {
            throw new Error(`user ${userId} has no active Stripe subscription to cancel`);
        }

        const subscription = await this.stripeService.cancelSubscriptionAtPeriodEnd(
            user.StripeSubscriptionId
        );

        const currentPeriodEndUnix = this.stripeService.getCurrentPeriodEnd(subscription);
        user.StripeSubscriptionStatus = subscription.status;
        user.StripeCancelAtPeriodEnd = subscription.cancel_at_period_end;
        user.StripeCurrentPeriodEnd = currentPeriodEndUnix
            ? new Date(currentPeriodEndUnix * 1000)
            : null;
        user.CancelReason = cancelReason?.trim() || null;
        await this.appDataSource.manager.save(user);

        return {
            status: user.StripeSubscriptionStatus,
            cancelAtPeriodEnd: user.StripeCancelAtPeriodEnd,
            currentPeriodEnd: user.StripeCurrentPeriodEnd,
        };
    }
}
