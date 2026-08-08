import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import UserService from 'src/service/UserService';
import Auth0ManagementService from 'src/service/Auth0ManagementService';
import * as Sentry from "@sentry/nestjs"

@UseGuards(JwtAuthGuard)
@Controller('user')
export default class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly auth0ManagementService: Auth0ManagementService,
    ) {}

    @Get()
    async getMe(@Req() req: { user: Auth0JwtPayload }) {
        try {
            return await this.userService.getMe(
                req.user.sub,
                !!req.user.email_verified,
            );
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            return new BadRequestException("could not load user profile");
        }
    }

    @Patch('profile')
    async updateProfile(
        @Req() req: { user: Auth0JwtPayload },
        @Body() body: { fullName?: string },
    ) {
        try {
            if (!body.fullName) {
                throw new BadRequestException("fullName is required");
            }
            return await this.userService.updateProfile(req.user.sub, body.fullName);
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            if (error instanceof BadRequestException) {
                throw error;
            }
            return new BadRequestException("could not update user profile");
        }
    }

    @Post('resend-verification')
    async resendVerification(@Req() req: { user: Auth0JwtPayload }) {
        try {
            if (req.user.email_verified) {
                return { sent: false, alreadyVerified: true };
            }
            return await this.auth0ManagementService.resendVerificationEmail(req.user.sub);
        } catch (error: any) {
            Sentry.captureException(error, { user: req.user });
            throw error;
        }
    }
}

