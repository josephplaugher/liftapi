import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm/dist/common";
import { DataSource } from "typeorm";
import UserService from "./UserService";
import LiftOption from "src/models/LiftOption";

@Injectable()
export default class LiftOptionService {
    constructor(
        @InjectDataSource() private readonly appDataSource: DataSource, 
        private readonly userService: UserService) { }

    async Get(sub: string) {
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        const liftOptions: LiftOption[] = await this.appDataSource.manager.find(LiftOption, {
            where: { UserId: id },
        });

        return liftOptions;
    }

    async Post(liftOption: LiftOption, sub: string) {
        if (!liftOption) {
            return new BadRequestException("Missing lift option name")
        }
        const userId = await this.userService.GetId(sub);
        if (!userId) throw new Error("User not found");

        liftOption.UserId = userId;

        const lo = this.appDataSource.manager.create(LiftOption, liftOption);
        await this.appDataSource.manager.save(lo);
        
        return "ok";
    }

    async Patch(liftOption: LiftOption, sub: string) {
        if (!liftOption) {
            return new BadRequestException("Missing lift option name")
        }
        const userId = await this.userService.GetId(sub);
        if (!userId) throw new Error("User not found");

        const liftOptionToUpdate: LiftOption | null = await this.appDataSource.manager.findOne(LiftOption, {
            where: { UserId: userId, Id: liftOption.Id },
        });
        if(liftOptionToUpdate == null) throw new Error("could not find lift option to update");

        liftOptionToUpdate.IsBarbellLift = liftOption.IsBarbellLift;
        liftOptionToUpdate.Name = liftOption.Name;

        await this.appDataSource.manager.save(LiftOption, liftOptionToUpdate)
        
        return "ok";
    }

    async Delete(liftOptionId: string, sub: string) {
        if (!liftOptionId) {
            return new BadRequestException("Missing lift option id");
        }
        const userId = await this.userService.GetId(sub);
        if (!userId) throw new Error("User not found");

        const liftOptionToDelete: LiftOption | null = await this.appDataSource.manager.findOne(LiftOption, {
            where: { UserId: userId, Id: liftOptionId },
        });
        if (liftOptionToDelete == null) throw new Error("could not find lift option to delete");

        await this.appDataSource.manager.remove(liftOptionToDelete);

        return "ok";
    }
}