import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

@Entity()
export default class Lift {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ nullable: false})
    Name: string;

    @Column()
    Weight: number;

    @Column({type: "timestamp", nullable: true})
    Date: string

    @Column()
    Set1: number;

    @Column()
    Set2?: number;

    @Column()
    Set3?: number;

    @Column()
    Set4?: number;

    @Column()
    Set5?: number;
}

export class LiftGraphable {
    Date: string;
    Load: number;
    Lift: Lift;
}