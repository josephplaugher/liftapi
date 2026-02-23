import { BadRequestException, Injectable, Req } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { error } from "console";
import { Auth0JwtPayload } from "src/models/JwtAuthPayload";
import User from "src/models/User";
import { DataSource } from "typeorm";

@Injectable()
export default class UserService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource) { }

    async getAuthorizedUser(sub: string) {
        const userExists = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        if (!userExists) {
            throw new Error(`can't find user by Sub ${sub}`);
        }
        return "ok";
    }

    async createNewUser(sub: string) {
        const user = this.appDataSource.manager.create(User, { Sub: sub });
        await this.appDataSource.manager.save(user);
        return "ok";
    }

    async GetId(sub: string) {
        const user = await this.appDataSource.manager.findOne(User, {
            where: { Sub: sub }
        });
        if(!user) {
            throw new Error(`can't find user ID by Sub ${sub}`);
        }
        return user?.Id;
    }

    async verifyPaymentStatus(sub: string) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        if(!user) {
            throw new Error(`can't find user by Sub ${sub}`);
        }
        return user.StripePaymentStatus;
    }
}
