import { BadRequestException, Injectable } from "@nestjs/common";
import User from "src/models/User";
import { StripeService } from "./StripeService";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import UserService from "./UserService";
import Lift from "src/models/Lift";
import LiftOption from "src/models/LiftOption";

@Injectable()
export default class LiftOptionService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource, private readonly userService: UserService) { }

    async Get(sub: string) {
        const id = await this.userService.GetId(sub);
        if (!id) throw new Error("User not found");

        const liftOptions: LiftOption[] = await this.appDataSource.manager.find(LiftOption, {
            where: { UserId: id },
        });

        return liftOptions;
    }

    // async GetById(optionId: string, sub: string) {
    //     const userId = await this.userService.GetId(sub);
    //     if (!userId) throw new Error("User not found");

    //     const liftOption = await this.appDataSource.manager.find<LiftOption>(LiftOption, {
    //         where: { Id: optionId, UserId: userId },
    //     });
    //     if (liftOption == null) { return new BadRequestException("lift option not found") }
    //     return liftOption;
    // }

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
}