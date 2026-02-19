import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import LiftOption from 'src/models/LiftOption';
import LiftOptionService from 'src/service/LiftOptionService';

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
            return new BadRequestException(error)
        }
    }

    // @Get()
    // async GetById(optionId: string, @Req() req: { user: Auth0JwtPayload }) {
    //     const userId = await this.userIdService.GetId(req.user.sub);
    //     if (!userId) throw new Error("User not found");

    //     const liftOption = await AppDataSource.manager.find<LiftOption>(LiftOption, {
    //         where: { Id: optionId, UserId: userId },
    //     });
    //     if (liftOption == null) { return new BadRequestException("lift option not found") }
    //     return liftOption;
    // }

    @Post()
    async Post(@Body() liftOption: LiftOption, @Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.liftOptionService.Post(liftOption, req.user.sub);
            return "ok";
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }
}