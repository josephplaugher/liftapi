import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('LiftController (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;

    // Mock user, since JwtGuard expects req.user.sub
    const mockUserId = 'auth0|mockuserid';

    // Utility to generate a fake JWT (could replace/customize if real Auth0 used in e2e)
    const getJwt = (sub: string = mockUserId) => {
        const makeTestJwt = (payload: object) => {
            const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
            const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
            const sig = "testsig"; // dummy signature, not verified in tests
            return `${header}.${body}.${sig}`;
        };
        return makeTestJwt({ sub });
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
        await app.init();

        jwtToken = getJwt();
    });


    afterAll(async () => {
        await app.close();
    });

    let createdLiftId: string;
    const testLift = {
        Id: undefined, // will be returned
        Name: 'Bench Press',
        Weight: 100,
        Reps: 10,
        Notes: 'Test set'
    };

    describe('/Lift (GET)', () => {
        it('should return array of lifts (possibly empty)', async () => {
            const res = await request(app.getHttpServer())
                .get('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('/Lift (POST)', () => {
        it('should add a lift', async () => {
            const res = await request(app.getHttpServer())
                .post('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(testLift);
            expect(res.status).toBe(201);
            expect(res.text).toBe('ok');

            // Get lifts, fetch the created one
            const getRes = await request(app.getHttpServer())
                .get('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(getRes.status).toBe(200);
            const lifts = getRes.body;
            // Find a lift by Name
            const foundLift = lifts.find((l: any) => l.Name === testLift.Name && l.Weight === testLift.Weight);
            expect(foundLift).toBeDefined();
            createdLiftId = foundLift.Id;
        });
    });

    describe('/Lift/:name (GET)', () => {
        it('should return lifts by name', async () => {
            const res = await request(app.getHttpServer())
                .get(`/Lift/${encodeURIComponent(testLift.Name)}`)
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.some((lift: any) => lift.Name === testLift.Name)).toBe(true);
        });
    });

    describe('/Lift (PATCH)', () => {
        it('should update an existing lift', async () => {
            const updatedLift = {
                ...testLift,
                Id: createdLiftId,
                Weight: 120,
            };

            const res = await request(app.getHttpServer())
                .patch('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(updatedLift);
            expect(res.status).toBe(200);
            expect(res.text).toBe('ok');

            // Verify update
            const getRes = await request(app.getHttpServer())
                .get('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`);
            const foundLift = getRes.body.find((l: any) => l.Id === createdLiftId);
            expect(foundLift).toBeDefined();
            expect(foundLift.Weight).toBe(120);
        });
    });

    describe('/Lift (DELETE)', () => {
        it('should delete the created lift', async () => {
            const res = await request(app.getHttpServer())
                .delete('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ Id: createdLiftId });
            expect(res.status).toBe(200);
            expect(res.text).toBe('ok');

            // Verify removal
            const getRes = await request(app.getHttpServer())
                .get('/Lift')
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body.find((l: any) => l.Id === createdLiftId)).toBeUndefined();
        });
    });

    // Optionally - test 401 for missing/invalid token
    describe('Auth Guard', () => {
        it('should fail without Authorization header', async () => {
            const res = await request(app.getHttpServer())
                .get('/Lift');
            expect(res.status).toBe(401);
        });
    });
});