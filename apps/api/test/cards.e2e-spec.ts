import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './app-init';

describe('Cards (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let businessId: string;
  let cardId: string;
  let cardSlug: string;

  beforeAll(async () => {
    app = await createTestApp();
    const res = await request(app.getHttpServer())
      .post('/api/register')
      .send({ email: `card-e2e-${Date.now()}@e2e.example.com`, password: 'Test1234!', firstName: 'Card', lastName: 'Tester' });
    token = res.body.data.token;

    const bizRes = await request(app.getHttpServer())
      .post('/api/businesses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Card Test Biz', description: 'Test business for card e2e' });
    businessId = bizRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CRUD', () => {
    it('POST /api/cards — create card under business', () => {
      return request(app.getHttpServer())
        .post('/api/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: `card-crud-${Date.now()}`, type: 'BUSINESS', business_id: businessId })
        .expect(201)
        .expect((res) => {
          cardId = res.body.data.id;
          cardSlug = res.body.data.slug;
          expect(res.body.data.slug).toBeDefined();
        });
    });

    it('GET /api/cards/by-slug/:slug — public read by slug', () => {
      return request(app.getHttpServer())
        .get(`/api/cards/by-slug/${cardSlug}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('PATCH /api/cards/:id — update own card', () => {
      return request(app.getHttpServer())
        .patch(`/api/cards/${cardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'BUSINESS' })
        .expect(200);
    });

    it('GET /api/users/me/cards — list my cards', () => {
      return request(app.getHttpServer())
        .get('/api/users/me/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Auth', () => {
    it('no token create → 401', () => {
      return request(app.getHttpServer())
        .post('/api/cards')
        .send({ slug: 'no-auth-card', type: 'BUSINESS', business_id: businessId })
        .expect(401);
    });
  });
});
