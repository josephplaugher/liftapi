export interface Auth0JwtPayload {
    sub: string;
    email?: string;
    email_verified?: boolean;
    aud: string | string[];
    iss: string;
    exp: number;
    iat: number;
    [key: string]: any; // for extra claims
}
