import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CredentialRequest, GoogleAuth, OAuth2Client } from 'google-auth-library';
import AppDataSource from 'src/data/AppDataSource';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { GoogleAuthDto } from 'src/models/GoogleAuthDto';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import Lift from 'src/models/Lift';

@Controller('Auth')
export default class AuthController {
    constructor() {
    }

    // @Post('google')
    // async PostGoogle(@Body() body: any) {
    //     const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    //     if (!body) {
    //         return "empty request body";
    //     }
    //     const cred = body.credential
    //     try {
    //         const ticket = await client.verifyIdToken({
    //             idToken: cred.credential,
    //             audience: process.env.GOOGLE_CLIENT_ID, // Must match the client_id from your front end
    //         });

    //         const payload = ticket.getPayload();

    //         const userData = {
    //             googleId: payload?.sub,
    //             email: payload?.email,
    //             name: payload?.name,
    //             picture: payload?.picture,
    //         };
    //     } catch (error: any) {
    //         return new BadRequestException(error)
    //     }

    //     return "ok";
    // }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    // @Get()
    getProtected(@Req() req: { user: Auth0JwtPayload }) {
        return {
            message: 'You are authenticated',
            sub: req.user.sub,
            email: req.user.email
        };
    }
}