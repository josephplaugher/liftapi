import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

type CachedToken = {
    accessToken: string;
    expiresAt: number;
};

type Auth0User = {
    user_id: string;
    email?: string;
    email_verified?: boolean;
    identities?: Array<{ user_id: string; provider: string; connection?: string }>;
};

type Auth0Job = {
    id: string;
    type?: string;
    status?: string;
    created_at?: string;
    percentage_done?: number;
    summary?: Record<string, unknown>;
};

@Injectable()
export default class Auth0ManagementService {
    private readonly logger = new Logger(Auth0ManagementService.name);
    private cachedToken: CachedToken | null = null;

    private get domain(): string {
        const issuer = process.env.AUTH0_ISSUER;
        if (!issuer) {
            throw new Error('AUTH0_ISSUER is not configured');
        }
        return new URL(issuer).host;
    }

    private async getManagementToken(): Promise<string> {
        if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
            return this.cachedToken.accessToken;
        }

        const clientId = process.env.AUTH0_M2M_CLIENT_ID?.replace(/^["']|["']$/g, '');
        const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET?.replace(/^["']|["']$/g, '');
        if (!clientId || !clientSecret) {
            throw new Error(
                'AUTH0_M2M_CLIENT_ID and AUTH0_M2M_CLIENT_SECRET must be set for verification email resend',
            );
        }

        this.logger.log(`Requesting Auth0 management token for M2M client ${clientId}`);

        // Omit `scope` so Auth0 returns whatever permissions this M2M app is authorized for.
        // Requesting ungranted scopes causes: "Client has not been granted scopes: ..."
        const response = await fetch(`https://${this.domain}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                audience: `https://${this.domain}/api/v2/`,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new UnauthorizedException(`Failed to get Auth0 management token: ${body}`);
        }

        const data = await response.json() as { access_token: string; expires_in: number; scope?: string };
        this.logger.log(`Auth0 management token scopes: ${data.scope || '(none returned)'}`);

        if (!data.scope?.includes('update:users') || !data.scope?.includes('read:users')) {
            throw new UnauthorizedException(
                `M2M app ${clientId} is missing required Management API scopes. ` +
                `Token has: [${data.scope || 'none'}]. Need: read:users, update:users. ` +
                `Authorize them under Applications → APIs → Auth0 Management API → Machine to Machine Applications.`,
            );
        }

        this.cachedToken = {
            accessToken: data.access_token,
            expiresAt: Date.now() + (data.expires_in - 60) * 1000,
        };
        return this.cachedToken.accessToken;
    }

    private async getUser(userId: string, token: string): Promise<Auth0User> {
        const response = await fetch(
            `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) {
            const body = await response.text();
            throw new BadRequestException(`Failed to load Auth0 user: ${body}`);
        }
        return response.json() as Promise<Auth0User>;
    }

    private async getJob(jobId: string, token: string): Promise<Auth0Job> {
        const response = await fetch(
            `https://${this.domain}/api/v2/jobs/${encodeURIComponent(jobId)}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) {
            const body = await response.text();
            throw new BadRequestException(`Failed to load Auth0 job status: ${body}`);
        }
        return response.json() as Promise<Auth0Job>;
    }

    private async waitForJob(jobId: string, token: string): Promise<Auth0Job> {
        let job = await this.getJob(jobId, token);
        for (let i = 0; i < 5 && job.status === 'pending'; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            job = await this.getJob(jobId, token);
        }
        return job;
    }

    async resendVerificationEmail(userId: string) {
        if (!userId) {
            throw new BadRequestException('user id is required');
        }

        const token = await this.getManagementToken();
        const auth0User = await this.getUser(userId, token);

        this.logger.log(
            `Resend verification for ${auth0User.user_id} email=${auth0User.email} verified=${auth0User.email_verified}`,
        );

        if (auth0User.email_verified) {
            return { sent: false, alreadyVerified: true };
        }

        if (!auth0User.email) {
            throw new BadRequestException('Auth0 user has no email address');
        }

        const payload: {
            user_id: string;
            client_id?: string;
            identity?: { user_id: string; provider: string };
        } = { user_id: userId };

        const spaClientId = process.env.AUTH0_SPA_CLIENT_ID?.replace(/^["']|["']$/g, '');
        if (spaClientId) {
            payload.client_id = spaClientId;
        }

        // Prefer the database (auth0) identity when present — social logins are already verified
        const dbIdentity = auth0User.identities?.find((identity) => identity.provider === 'auth0');
        if (dbIdentity) {
            payload.identity = {
                user_id: dbIdentity.user_id,
                provider: dbIdentity.provider,
            };
        }

        const response = await fetch(`https://${this.domain}/api/v2/jobs/verification-email`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Auth0 verification job create failed: ${body}`);
            throw new BadRequestException(`Failed to resend verification email: ${body}`);
        }

        const created = await response.json() as Auth0Job;
        this.logger.log(`Auth0 verification job created: ${JSON.stringify(created)}`);

        const job = created.id ? await this.waitForJob(created.id, token) : created;
        this.logger.log(`Auth0 verification job status: ${JSON.stringify(job)}`);

        if (job.status === 'failed') {
            throw new BadRequestException(
                `Auth0 failed to send verification email (job ${job.id}). Check Auth0 email provider settings and Monitoring > Logs.`,
            );
        }

        return {
            sent: true,
            jobId: job.id,
            jobStatus: job.status ?? 'queued',
            email: auth0User.email,
        };
    }
}
