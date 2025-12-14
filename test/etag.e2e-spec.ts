import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ETag Integration (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should return 200 and ETag on first request', async () => {
        const response = await request(app.getHttpServer())
            .get('/feature-flags')
            .expect(200);

        expect(response.headers['etag']).toBeDefined();
    });

    it('should return 304 when ETag matches', async () => {
        // 1. First request to get ETag
        const firstResponse = await request(app.getHttpServer())
            .get('/feature-flags')
            .expect(200);

        const etag = firstResponse.headers['etag'];

        // 2. Second request with If-None-Match
        await request(app.getHttpServer())
            .get('/feature-flags')
            .set('If-None-Match', etag)
            .expect(304);
    });

    it('should return 200 and new ETag when data changes', async () => {
        // 1. Create a flag to ensure there is data
        await request(app.getHttpServer())
            .post('/feature-flags')
            .send({ key: 'etag-test-flag', name: 'ETag Test', isEnabled: false })
            .expect(201);

        // 2. Get initial ETag
        const firstResponse = await request(app.getHttpServer())
            .get('/feature-flags')
            .expect(200);
        const etag1 = firstResponse.headers['etag'];

        // 3. Update the flag
        await request(app.getHttpServer())
            .patch('/feature-flags/etag-test-flag')
            .send({ isEnabled: true })
            .expect(200);

        // 4. Request with old ETag -> Should get 200 and new ETag
        const secondResponse = await request(app.getHttpServer())
            .get('/feature-flags')
            .set('If-None-Match', etag1)
            .expect(200);

        const etag2 = secondResponse.headers['etag'];
        expect(etag2).not.toBe(etag1);
    });
});
