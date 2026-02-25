import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import UserService from "./UserService";
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