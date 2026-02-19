import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import UserService from 'src/service/UserService';

@Controller('Auth')
export default class AuthController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProtected(@Req() req: { user: Auth0JwtPayload }) {
        try {
            await this.userService.getOrCreateAuthorizedUser(req.user.sub);
            return "ok";
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }
}