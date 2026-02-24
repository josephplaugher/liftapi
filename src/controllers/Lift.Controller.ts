import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import Lift from 'src/models/Lift';
import LiftService from 'src/service/LiftService';
import UserService from 'src/service/UserService';

@UseGuards(JwtAuthGuard)
@Controller('Lift')
export default class LiftController {
    constructor(private readonly liftService: LiftService) { }

    @Get()
    async Get(@Req() req: { user: Auth0JwtPayload }) {
        try {
            const lifts = await this.liftService.getLifts(req.user.sub);
            return lifts;
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(error)
        }
    }

    @Get(':name')
    async GetByName(@Param('name') name: string, @Req() req: { user: Auth0JwtPayload }) {
        try {
            const lifts = await this.liftService.getByName(name, req.user.sub);
            return lifts;
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(error)
        }
    }

    @Post()
    async Post(@Body() lift: Lift, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftService.AddSet(lift, req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(error)
        }
    }
}