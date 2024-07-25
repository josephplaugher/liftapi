import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

@Entity()
export default class Lift {
    @PrimaryGeneratedColumn("uuid")
    Id?: string;

    @Column()
    Name: string;

    @Column()
    Weight: number;

    @Column()
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

// export class LiftDto {
//     Name: string;
//     Weight: number;
//     Date: string;
//     Set1: number;
//     Set2?: number;
//     Set3?: number;
//     Set4?: number;
//     Set5?: number;
// }