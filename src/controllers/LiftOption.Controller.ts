import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import LiftOption from 'src/models/LiftOption';
import UserService from 'src/service/UserService';

@UseGuards(JwtAuthGuard)
@Controller('LiftOption')
export default class LiftOptionController {
    constructor(private readonly userIdService: UserService) { }

    @Get()
    async Get(@Req() req: { user: Auth0JwtPayload }) {
        const id = await this.userIdService.GetId(req.user.sub);
        if (!id) throw new Error("User not found");

        try {
            const liftOptions: LiftOption[] = await AppDataSource.manager.find(LiftOption, {
                where: { UserId: id },
            });

            return liftOptions;
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }

    @Get()
    async GetById(optionId: string, @Req() req: { user: Auth0JwtPayload }) {
        const userId = await this.userIdService.GetId(req.user.sub);
        if (!userId) throw new Error("User not found");

        const liftOption = await AppDataSource.manager.find<LiftOption>(LiftOption, {
            where: { Id: optionId, UserId: userId },
        });
        if (liftOption == null) { return new BadRequestException("lift option not found") }
        return liftOption;
    }

    @Post()
    async Post(@Body() liftOption: LiftOption, @Req() req: { user: Auth0JwtPayload }) {
        if (!liftOption) {
            return "empty request body";
        }
        const userId = await this.userIdService.GetId(req.user.sub);
        if (!userId) throw new Error("User not found");

        liftOption.UserId = userId;

        try {
            const lo = await AppDataSource.manager.create(LiftOption, liftOption)
            await AppDataSource.manager.save(lo);
            return "ok";
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }
}