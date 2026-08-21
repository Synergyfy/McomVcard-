import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './app-init';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let businessId: string;
  let cardId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Login as admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 'admin@example.com', password: 'secret123' });
    adminToken = adminRes.body.data.token;

    // Register a regular user
    const userRes = await request(app.getHttpServer())
      .post('/api/register')
      .send({ email: `admin-e2e-${Date.now()}@e2e.example.com`, password: 'Test1234!', firstName: 'Test', lastName: 'User' });
    userToken = userRes.body.data.token;

    // Get user ID
    const meRes = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Bearer ${userToken}`);
    userId = meRes.body.data.id;

    // Create business + card for testing
    const bizRes = await request(app.getHttpServer())
      .post('/api/businesses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Test Biz', description: 'Test business for admin e2e' });
    businessId = bizRes.body.data?.id;

    if (businessId) {
      const cardRes = await request(app.getHttpServer())
        .post('/api/cards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: `admin-test-card-${Date.now()}`, type: 'BUSINESS', business_id: businessId });
      cardId = cardRes.body.data?.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Dashboard', () => {
    it('GET /api/admin — admin 200', () => {
      return request(app.getHttpServer())
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('GET /api/admin — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Users', () => {
    it('GET /api/admin/users — paginated list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('meta');
        });
    });

    it('GET /api/admin/users?search — search works', () => {
      return request(app.getHttpServer())
        .get('/api/admin/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/users/:id — get by id', () => {
      return request(app.getHttpServer())
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(userId);
        });
    });

    it('PATCH /api/admin/users/:id/status — update status', () => {
      return request(app.getHttpServer())
        .patch(`/api/admin/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' })
        .expect(200);
    });

    it('GET /api/admin/users — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Businesses', () => {
    it('GET /api/admin/businesses — paginated list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/businesses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('data');
        });
    });

    it('GET /api/admin/businesses/:id — get by id', () => {
      if (!businessId) return Promise.resolve();
      return request(app.getHttpServer())
        .get(`/api/admin/businesses/${businessId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/businesses — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/businesses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Cards', () => {
    it('GET /api/admin/cards — paginated list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/cards')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('data');
        });
    });

    it('GET /api/admin/cards — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/cards')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Templates', () => {
    let templateId: string;

    it('POST /api/admin/templates — create', () => {
      return request(app.getHttpServer())
        .post('/api/admin/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `Test Template ${Date.now()}`, description: 'E2E test' })
        .expect(201)
        .expect((res) => {
          templateId = res.body.data.id;
        });
    });

    it('GET /api/admin/templates — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PATCH /api/admin/templates/:id — update', () => {
      return request(app.getHttpServer())
        .patch(`/api/admin/templates/${templateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Template' })
        .expect(200);
    });

    it('DELETE /api/admin/templates/:id — delete', () => {
      return request(app.getHttpServer())
        .delete(`/api/admin/templates/${templateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Memberships', () => {
    it('GET /api/admin/memberships — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/memberships — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/memberships')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Finance', () => {
    it('GET /api/admin/finance/wallets — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/finance/wallets')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/finance/rewards — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/finance/rewards')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/finance/cashback — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/finance/cashback')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/finance/wallets — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/finance/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Vouchers', () => {
    it('GET /api/admin/vouchers — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/vouchers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/vouchers — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/vouchers')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Campaigns', () => {
    it('GET /api/admin/campaigns — list', () => {
      return request(app.getHttpServer())
        .get('/api/admin/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /api/admin/campaigns — non-admin 403', () => {
      return request(app.getHttpServer())
        .get('/api/admin/campaigns')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Auth guards', () => {
    it('no token → 401', () => {
      return request(app.getHttpServer())
        .get('/api/admin/users')
        .expect(401);
    });
  });
});
