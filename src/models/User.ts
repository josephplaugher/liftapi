
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ unique: true, nullable: false })
    Sub: string;

    @Column({ unique: true, nullable: true })
    LastStripeSessionId: string;

    @Column({ unique: true, nullable: true })
    StripeCustomerId: string;

    @Column({ unique: true, nullable: true })
    StripeSubscriptionId: string;

    @Column({ nullable: true })
    StripeSubscriptionStatus: boolean;

    @Column({ unique: true, nullable: true })
    StripePriceId: string;
}

export class UserDto {
    Id: string;
    Email: string;
    Name: string;
    Password: string;
}