import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './app-init';

describe('Businesses (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let businessId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const res = await request(app.getHttpServer())
      .post('/api/register')
      .send({ email: `biz-e2e-${Date.now()}@e2e.example.com`, password: 'Test1234!', firstName: 'Biz', lastName: 'Tester' });
    token = res.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CRUD', () => {
    it('POST /api/businesses — create', () => {
      return request(app.getHttpServer())
        .post('/api/businesses')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'E2E Business', description: 'Test business for e2e' })
        .expect(201)
        .expect((res) => {
          businessId = res.body.data.id;
          expect(res.body.data.name).toBe('E2E Business');
        });
    });

    it('GET /api/users/me/businesses — list mine', () => {
      return request(app.getHttpServer())
        .get('/api/users/me/businesses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /api/businesses/:id — get by id', () => {
      return request(app.getHttpServer())
        .get(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('PATCH /api/businesses/:id — update', () => {
      return request(app.getHttpServer())
        .patch(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Business' })
        .expect(200);
    });

    it('GET /api/businesses/:id — foreign user can read (no ownership check)', async () => {
      const foreignRes = await request(app.getHttpServer())
        .post('/api/register')
        .send({ email: `foreign-biz-${Date.now()}@e2e.example.com`, password: 'Test1234!' });
      const foreignToken = foreignRes.body.data.token;

      return request(app.getHttpServer())
        .get(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${foreignToken}`)
        .expect(200);
    });
  });

  describe('Cards under business', () => {
    let cardId: string;

    it('POST /api/cards — create card under business', async () => {
      if (!businessId) {
        const bizRes = await request(app.getHttpServer())
          .post('/api/businesses')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Card Test Biz', description: 'Test business for card e2e' });
        businessId = bizRes.body.data?.id;
      }
      return request(app.getHttpServer())
        .post('/api/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: `e2e-card-${Date.now()}`, type: 'BUSINESS_VCARD', card_product: 'VCARD', audience: 'BUSINESS', business_id: businessId })
        .expect(201)
        .expect((res) => {
          cardId = res.body.data.id;
        });
    });

    it('GET /api/users/me/cards — list my cards', () => {
      return request(app.getHttpServer())
        .get('/api/users/me/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Auth', () => {
    it('no token → 401', () => {
      return request(app.getHttpServer())
        .get('/api/users/me/businesses')
        .expect(401);
    });
  });
});
