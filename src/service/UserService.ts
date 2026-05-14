import { BadRequestException, Injectable, Req } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm/dist/common";
import { error } from "console";
import { Auth0JwtPayload } from "src/models/JwtAuthPayload";
import LiftOption from "src/models/LiftOption";
import User from "src/models/User";
import { DataSource } from "typeorm";

@Injectable()
export default class UserService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource) { }

    async getOrCreateUser(sub: string) {
        const userExists = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        if (!userExists) {
            const user = await this.appDataSource.manager.create(User, { Sub: sub });
            const savedUser = await this.appDataSource.manager.save(user);
            const liftOptions = await this.appDataSource.manager.create(LiftOption, [
                { UserId: savedUser.Id, Name: "Deadlift", IsBarbellLift: true },
                { UserId: savedUser.Id, Name: "Squat", IsBarbellLift: true },
                { UserId: savedUser.Id, Name: "Bench Press", IsBarbellLift: true },
            ]);
            await this.appDataSource.manager.save(liftOptions);
        }
        return "ok";
    }

    async GetId(sub: string) {
        const user = await this.appDataSource.manager.findOne(User, {
            where: { Sub: sub }
        });
        if (!user) {
            throw new Error(`can't find user ID by Sub ${sub}`);
        }
        return user?.Id;
    }

    async verifyPaymentStatus(sub: string) {
        const user = await this.appDataSource.manager.findOne<User>(User, {
            where: { Sub: sub }
        });
        if (!user) {
            return null;
        }
        return user.StripeSubscriptionStatus;
    }
}
