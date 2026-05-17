import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import LiftOption from 'src/models/LiftOption';
import LiftOptionService from 'src/service/LiftOptionService';
import * as Sentry from "@sentry/nestjs"

@UseGuards(JwtAuthGuard)
@Controller('LiftOption')
export default class LiftOptionController {
    constructor(private readonly liftOptionService: LiftOptionService) { }

    @Get()
    async Get(@Req() req: { user: Auth0JwtPayload }) {
        try {
            const liftOptions: LiftOption[] = await this.liftOptionService.Get(req.user.sub);
            return liftOptions;
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException("could not get lift options")
        }
    }

    @Post()
    async Post(@Body() liftOption: LiftOption, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftOptionService.Post(liftOption, req.user.sub);
            return "ok";
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException(`could not create new lift option ${liftOption}`)
        }
    }

    @Patch()
    async Patch(@Body() liftOption: LiftOption, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftOptionService.Patch(liftOption, req.user.sub);
            return "ok";
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user});
            return new BadRequestException(`could not update lift option ${liftOption?.Id}`)
        }
    }

    @Delete()
    async Delete(@Body() body: {Id: string}, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftOptionService.Delete(body.Id, req.user.sub);
            return "ok";
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException(`could not delete lift option ${body.Id}`)
        }
    }
}