
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ unique: true, nullable: false })
    Sub: string;

    @Column({ unique: true, nullable: true })
    StripeCustomerId: string;

    @Column({ unique: true, nullable: true })
    StripeSubscriptionId: string;

    @Column({ nullable: true })
    StripeSubscriptionStatus: string;

    @Column({ nullable: true })
    StripePaymentStatus: string;

    @Column({ nullable: true })
    StripePriceId: string;

    @Column({ type: "timestamp", nullable: true })
    StripeCurrentPeriodEnd: Date | null;

    @Column({ nullable: true })
    StripeCancelAtPeriodEnd: boolean;

    @Column({ type: "timestamp", nullable: true })
    StripeTrialEnd: Date | null
}

export class UserDto {
    Id: string;
    Email: string;
    Name: string;
    Password: string;
}