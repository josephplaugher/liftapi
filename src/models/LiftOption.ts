import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class LiftOption {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column()
    Name: string;

    @Column()
    IsBarbellLift: boolean;
}