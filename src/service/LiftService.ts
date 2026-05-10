import { BadRequestException, Injectable } from "@nestjs/common";
import User from "src/models/User";
import { StripeService } from "./StripeService";
import { InjectDataSource } from "@nestjs/typeorm/dist/common";
import { Between, DataSource } from "typeorm";
import UserService from "./UserService";
import Lift, { LiftGraphable } from "src/models/Lift";
import { groupBy } from "rxjs";

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

    async getByGroupedHistory(sub: string, liftName: string, startDate: string, endDate: string) {
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        const lifts = await this.appDataSource.manager.find(Lift, {
            where: {
                UserId: id,
                Name: liftName,
                Date: Between(new Date(startDate).toISOString(),
                    new Date(endDate).toISOString())
            },
            order: { Date: 'ASC' },
        });

        const results = lifts.map(lift => ({
            Date: new Date(lift.Date).toISOString().split('T')[0],
            Load: lift.Weight * (lift.Set1 + (lift.Set2 ?? 0) + (lift.Set3 ?? 0) + (lift.Set4 ?? 0) + (lift.Set5 ?? 0))
          }));

        return results;
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

    async UpdateSet(lift: Lift, sub: string) {
        if (!lift || !lift.Id) {
            throw new Error("Missing lift or lift ID");
        }
        const userId = await this.userService.GetId(sub);
        if (!userId) throw new Error("User not found");

        const existingLift: Lift | null = await this.appDataSource.manager.findOne(Lift, {
            where: { UserId: userId, Id: lift.Id },
        });

        if (!existingLift) {
            throw new Error(`Lift not found for id ${lift.Id} and user`);
        }

        existingLift.Name = lift.Name;
        existingLift.Weight = lift.Weight;
        existingLift.Date = lift.Date;
        existingLift.Set1 = lift.Set1;
        existingLift.Set2 = lift.Set2;
        existingLift.Set3 = lift.Set3;
        existingLift.Set4 = lift.Set4;
        existingLift.Set5 = lift.Set5;

        await this.appDataSource.manager.save(existingLift);
        return "ok";
    }

    async DeleteSet(liftId: string, sub: string) {
        if (!liftId) {
            throw new Error("Missing lift ID");
        }
        const userId = await this.userService.GetId(sub);
        if (!userId) throw new Error("User not found");

        const liftToDelete: Lift | null = await this.appDataSource.manager.findOne(Lift, {
            where: { UserId: userId, Id: liftId }, order: { Date: 'desc' },
        });

        if (!liftToDelete) {
            throw new Error(`Lift not found for id ${liftId} and user`);
        }

        await this.appDataSource.manager.remove(liftToDelete);
        return "ok";
    }
}
