
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column()
    Name: string;

    @Column()
    Email: string;

    @Column()
    Password: string;
}

export class UserDto {
    Id: string;
    Email: string;
    Name: string;
    Password: string;
}