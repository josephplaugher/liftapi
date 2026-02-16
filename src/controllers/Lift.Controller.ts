import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import Lift from 'src/models/Lift';
import UserService from 'src/service/UserService';

@UseGuards(JwtAuthGuard)
@Controller('Lift')
export default class LiftController {
    constructor(private readonly userIdService: UserService) { }
    
    @Get()
    async Get(@Req() req: { user: Auth0JwtPayload }) {
        const id = await this.userIdService.GetId(req.user.sub);
        if (!id) throw new Error("User not found");

        const lifts: Lift[] = await AppDataSource.manager.find(Lift, {
            where: { UserId: id },
            order: {
                Date: "DESC"
            }
        });
        return lifts;
    }

    @Get(':name')
    async GetByName(@Param('name') name: string, @Req() req: { user: Auth0JwtPayload }) {
        const liftName = name.replace("_", " ");
        const id = await this.userIdService.GetId(req.user.sub);
        if (!id) throw new Error("User not found");

        const lift = await AppDataSource.manager.find<Lift>(Lift, {
            where: { UserId: id, Name: liftName },
            order: {
                Date: 'DESC',
            },
        });
        return lift;
    }

    @Post()
    async Post(@Body() lift: Lift, @Req() req: { user: Auth0JwtPayload }) {
        if (!lift) {
            throw new Error("empty request body");
        }
        const id = await this.userIdService.GetId(req.user.sub);
        if (!id) throw new Error("User not found");

        lift.UserId = id;
        lift.Date = new Date().toLocaleDateString('en-US');

        try {
            const newLift = await AppDataSource.manager.create(Lift, lift)
            await AppDataSource.manager.save(newLift);
            return "ok";
        } catch (error: any) {
            return new BadRequestException(error)
        }

    }
}