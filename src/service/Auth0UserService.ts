// import { Injectable } from '@nestjs/common';
// // import axios from 'axios';
// import { auth } from "express-oauth2-jwt-bearer";

// @Injectable()
// export class Auth0UserService {
//   private domain = process.env.AUTHO_TENANT;
//   private clientId = 'M2M_CLIENT_ID';
//   private clientSecret = 'M2M_CLIENT_SECRET';
//   private audience = `https://${this.domain}/api/v2/`;

//   private token: string | null = null;

//   private async getManagementToken() {
//     if (this.token) return this.token;

//    const jwtCheck = auth({
//   audience: process.env.API_URL,
//   issuerBaseURL: 'https://dev-f140wsj24wy83766.us.auth0.com/',
//   tokenSigningAlg: 'RS256'
// });

//     this.token = res.data.access_token;
//     return this.token;
//   }

//   async getUser(auth0UserId: string) {
//     const mgmtToken = await this.getManagementToken();
//     const res = await axios.get(
//       `https://${this.domain}/api/v2/users/${auth0UserId}`,
//       { headers: { Authorization: `Bearer ${mgmtToken}` } }
//     );

//     return res.data;
//   }
// }
