import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import Lift from 'src/models/Lift';
import LiftService from 'src/service/LiftService';
import * as Sentry from "@sentry/nestjs"

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
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException(error)
        }
    }
    
    @Get('history/grouped')
    async GetByGroupedHistory(@Query('name') name: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Req() req: { user: Auth0JwtPayload }) {
        try {
            const lifts = await this.liftService.getByGroupedHistory(req.user.sub, name, startDate, endDate);
            return lifts;
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(`something went wrong getting the history for ${name}`)
        }
    }

    @Get(':name')
    async GetByName(@Param('name') name: string, @Req() req: { user: Auth0JwtPayload }) {
        try {
            const lifts = await this.liftService.getByName(name, req.user.sub);
            return lifts;
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(`could not find a lift by name ${name}`)
        }
    }

    @Post()
    async Post(@Body() lift: Lift, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftService.AddSet(lift, req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(`could not add that set ${lift}`)
        }
    }

    @Patch()
    async Patch(@Body() lift: Lift, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftService.UpdateSet(lift, req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(`could not update lift ${lift?.Id}`);
        }
    }

    @Delete()
    async Delete(@Body('Id') liftId: string, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftService.DeleteSet(liftId, req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException(`could not delete lift ${liftId}`);
        }
    }
}