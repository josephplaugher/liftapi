import { BadRequestException, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import UserService from 'src/service/UserService';

@Controller('Auth')
export default class AuthController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async retrieveUser(@Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.userService.getAuthorizedUser(req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException("could not find that user")
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addNewUser(@Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.userService.createNewUser(req.user.sub);
            return "ok";
        } catch (error: any) {
            console.log(error);
            return new BadRequestException("could not create a new user")
        }
    }
}