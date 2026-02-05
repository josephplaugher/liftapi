import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import AppDataSource from 'src/data/AppDataSource';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import User from 'src/models/User';

@Controller('Auth')
export default class AuthController {
    constructor() {
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProtected(@Req() req: { user: Auth0JwtPayload }) {
        try {
            const userExists = await AppDataSource.manager.findOne<User>(User, {
                where: { Sub: req.user.sub }
            });
            if (!userExists) {
                const user = await AppDataSource.manager.create(User, { Sub: req.user.sub });
                await AppDataSource.manager.save(user);
            }
            return "ok";
        } catch (error: any) {
            return new BadRequestException(error)
        }
    }
}