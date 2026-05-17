import { BadRequestException, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import UserService from 'src/service/UserService';
import * as Sentry from "@sentry/nestjs"

@Controller('Auth')
export default class AuthController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async retrieveUser(@Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.userService.getOrCreateUser(req.user.sub);
            return "ok";
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException("could not find that user")
        }
    }
}