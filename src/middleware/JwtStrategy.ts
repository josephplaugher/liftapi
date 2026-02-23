import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
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

  handleRequest<TUser = any>(err: Error | null, user: TUser | false, info: JsonWebTokenError | TokenExpiredError | null): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token expired');
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(`Invalid token - ${info.message}`);
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }

  async validate(payload: any) {
    return payload; // attaches payload to req.user
  }
}
