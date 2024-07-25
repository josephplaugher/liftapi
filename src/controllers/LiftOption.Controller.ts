import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import LiftOption from 'src/models/LiftOption';

@Controller('LiftOption')
export default class LiftOptionController {
    constructor() {
    }

    @Get()
    async Get() {
        const liftOptions: LiftOption[] = await AppDataSource.manager.find(LiftOption);
        return liftOptions;
    }

    @Get()
    async GetById(Id: string) {
        const liftOption = await AppDataSource.manager.findOneBy<LiftOption>(LiftOption, { Id });
        if (liftOption == null) { return new BadRequestException("lift option not found") }
        return liftOption;
    }

    @Post()
    async Post(@Body() liftOption: LiftOption) {
        if (!liftOption) {
            return "empty request body";
        }

        try {
            await AppDataSource.manager.insert(LiftOption, liftOption)
        } catch (error: any) {
            return new BadRequestException(error)
        }
        return "ok";
    }
}