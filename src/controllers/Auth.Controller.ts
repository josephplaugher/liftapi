import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CredentialRequest, GoogleAuth, OAuth2Client } from 'google-auth-library';
import AppDataSource from 'src/data/AppDataSource';
import { GoogleAuthDto } from 'src/models/GoogleAuthDto';
import Lift from 'src/models/Lift';

@Controller('Auth')
export default class AuthController {
    constructor() {
    }

    @Post('google')
    async Post(@Body() body: any) {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        if (!body) {
            return "empty request body";
        }
        const cred = body.credential
        try {
            const ticket = await client.verifyIdToken({
                idToken: cred.credential,
                audience: process.env.GOOGLE_CLIENT_ID, // Must match the client_id from your front end
            });

            const payload = ticket.getPayload();

            const userData = {
                googleId: payload?.sub,
                email: payload?.email,
                name: payload?.name,
                picture: payload?.picture,
            };
        } catch (error: any) {
            return new BadRequestException(error)
        }

        return "ok";
    }
}