import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import Lift from 'src/models/Lift';

@Controller('Lift')
export default class LiftController {
    constructor() {
    }

    @Get()
    async Get() {
        const lifts: Lift[] = await AppDataSource.manager.find(Lift, {
            order: {
                Date: "DESC"
            }
        });
        return lifts;
    }

    @Get(':name')
    async GetByName(@Param('name') name: string) {
        const liftName = name.replace("_", " ")
        const lift = await AppDataSource.manager.find<Lift>(Lift, {
            where: { Name: liftName },
            order: {
                Date: 'DESC',
            },
        });
        return lift;
    }

    @Post()
    async Post(@Body() lift: Lift) {
        if (!lift) {
            return "empty request body";
        }
        lift.Date = new Date().toLocaleDateString('en-US');

        try {
            await AppDataSource.manager.insert(Lift, lift)
        } catch (error: any) {
            return new BadRequestException(error)
        }

        return "ok";
    }
}