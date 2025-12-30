import { Injectable, NestMiddleware } from '@nestjs/common';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    expressjwt({
      secret: jwksRsa.expressJwtSecret({
        jwksUri: process.env.AUTH0_TENANT!,
        cache: true,
        rateLimit: true,
      }) as any,
      audience: process.env.API_URL,
      issuer: process.env.AUTH0_ISSUER,
      algorithms: ['RS256'],
      requestProperty: 'auth', // where the JWT payload will be stored
    })(req, res, next);
  }
}
