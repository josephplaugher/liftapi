export interface Auth0JwtPayload {
    sub: string;
    email?: string;
    aud: string | string[];
    iss: string;
    exp: number;
    iat: number;
    [key: string]: any; // for extra claims
}
