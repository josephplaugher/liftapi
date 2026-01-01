import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class LiftOption {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ type: 'uuid', nullable: true })
    UserId: string;

    @Column()
    Name: string;
}