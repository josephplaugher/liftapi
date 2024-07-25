import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import Lift from 'src/models/Lift';

@Controller('Lift')
export default class LiftController {
    constructor() {
    }

    @Get()
    async Get() {
        const lifts: Lift[] = await AppDataSource.manager.find(Lift);
        return lifts;
    }

    @Get()
    async GetById(Id: string) {
        const lift = await AppDataSource.manager.findOneBy<Lift>(Lift, { Id });
        return lift;
    }

    @Post()
    async Post(@Body() lift: Lift) {
        if (!lift) {
            return "empty request body";
        }

        try {
            await AppDataSource.manager.insert(Lift, lift)
        } catch (error: any) {
            return new BadRequestException(error)
        }

        return "ok";
    }
}