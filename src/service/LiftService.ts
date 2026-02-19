import { BadRequestException, Injectable } from "@nestjs/common";
import User from "src/models/User";
import { StripeService } from "./StripeService";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import UserService from "./UserService";
import Lift from "src/models/Lift";

@Injectable()
export default class LiftService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource, private readonly userService: UserService) { }

    async getLifts(sub: string) {
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        const lifts: Lift[] = await this.appDataSource.manager.find(Lift, {
            where: { UserId: id },
            order: {
                Date: "DESC"
            }
        });
        return lifts;
    }

    async getByName(name: string, sub: string) {
        const liftName = name.replace("_", " ");
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        const lift = await this.appDataSource.manager.find<Lift>(Lift, {
            where: { UserId: id, Name: liftName },
            order: {
                Date: 'DESC',
            },
        });
        return lift;
    }

    async AddSet(lift: Lift, sub: string) {
        if (!lift) {
            throw new Error("empty request body");
        }
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        lift.UserId = id;
        lift.Date = new Date().toLocaleDateString('en-US');

        const newLift = this.appDataSource.manager.create(Lift, lift);
        await this.appDataSource.manager.save(newLift);
    }
}
