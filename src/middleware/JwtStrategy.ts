import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AUTH0_TENANT!,
      }),
      issuer: process.env.AUTH0_ISSUER,
      audience: process.env.API_URL,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return payload; // attaches payload to req.user
  }
}
