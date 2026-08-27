import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './app-init';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const testEmail = `auth-test-${Date.now()}@e2e.example.com`;
  const testPassword = 'Test1234!';
  let token: string;

  describe('POST /api/register', () => {
    it('registers a new user', () => {
      return request(app.getHttpServer())
        .post('/api/register')
        .send({ email: testEmail, password: testPassword, firstName: 'Auth', lastName: 'Tester' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.token).toBeDefined();
          token = res.body.data.token;
        });
    });

    it('rejects duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/register')
        .send({ email: testEmail, password: testPassword, firstName: 'Auth', lastName: 'Tester' })
        .expect(400);
    });

    it('rejects invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/register')
        .send({ email: 'not-an-email', password: testPassword })
        .expect(400);
    });

    it('rejects short password', () => {
      return request(app.getHttpServer())
        .post('/api/register')
        .send({ email: `short-${Date.now()}@e2e.example.com`, password: '123' })
        .expect(400);
    });
  });

  describe('POST /api/login', () => {
    it('logs in with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.token).toBeDefined();
        });
    });

    it('rejects wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/login')
        .send({ email: testEmail, password: 'wrong1234' })
        .expect(401);
    });

    it('rejects non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'nonexistent@example.com', password: testPassword })
        .expect(401);
    });
  });

  describe('GET /api/user', () => {
    it('returns current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.email).toBe(testEmail);
        });
    });

    it('rejects missing token', () => {
      return request(app.getHttpServer()).get('/api/user').expect(401);
    });

    it('rejects invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
