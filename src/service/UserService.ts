import { Injectable, Req } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Auth0JwtPayload } from "src/models/JwtAuthPayload";
import User from "src/models/User";
import { DataSource } from "typeorm";

@Injectable()
export default class UserService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource) { }

    async getOrCreateAuthorizedUser(sub: string) {
        const userExists = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        if (!userExists) {
            const user = this.appDataSource.manager.create(User, { Sub: sub });
            await this.appDataSource.manager.save(user);
        }
        return "ok";
    }

    async GetId(userSub: string) {
        const result = await this.appDataSource.manager.findOne(User, {
            where: { Sub: userSub }
        });
        return result?.Id;
    }

    async verifyPaymentStatus(sub: string) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        return user?.StripePaymentStatus;
    }
}
