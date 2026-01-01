
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ unique: true, nullable: false })
    Sub: string;
}

export class UserDto {
    Id: string;
    Email: string;
    Name: string;
    Password: string;
}