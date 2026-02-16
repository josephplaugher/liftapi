import { Injectable } from "@nestjs/common";
import AppDataSource from "src/data/AppDataSource";
import User from "src/models/User";

@Injectable()
export default class UserService {
    async GetId(userSub: string) {
        const result = await AppDataSource.manager.findOne(User, {
            where: { Sub: userSub }
        });
        return result?.Id;
    }

    async verifyPaymentStatus(sub: string) {
        const user = await AppDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        return user?.StripePaymentStatus;
    }
}
