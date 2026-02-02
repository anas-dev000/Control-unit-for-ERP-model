import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Auth Integration', () => {
  const testUser = {
    companyName: 'Test Corp',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'Admin',
  };

  afterAll(async () => {
    // Cleanup if possible or use a separate test DB
    // For now, we'll just leave it if it's a dev DB
  });

  it('should register a new tenant and admin user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
  });
});
