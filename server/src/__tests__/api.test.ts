import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('MiniLedger Backend API Integration Tests', () => {
  const testPhoneUserA = '+919111111111';
  const testPhoneUserB = '+919222222222';
  let tokenUserA: string;
  let tokenUserB: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.loan.deleteMany({
      where: {
        user: {
          phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
        },
      },
    });
    await prisma.otpChallenge.deleteMany({
      where: {
        phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.loan.deleteMany({
      where: {
        user: {
          phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
        },
      },
    });
    await prisma.otpChallenge.deleteMany({
      where: {
        phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        phoneNumber: { in: [testPhoneUserA, testPhoneUserB] },
      },
    });
    await prisma.$disconnect();
  });

  describe('Health Endpoint', () => {
    it('GET /api/health should return healthy status and database connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('Authentication & Mock OTP Flow', () => {
    it('POST /api/auth/send-otp - should reject invalid phone numbers', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/send-otp - should send mock OTP for valid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: testPhoneUserA });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cooldownSeconds).toBe(30);
    });

    it('POST /api/auth/send-otp - should enforce cooldown on immediate repeated request', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: testPhoneUserA });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Please wait/);
    });

    it('POST /api/auth/verify-otp - should reject wrong OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhoneUserA, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid OTP/);
    });

    it('POST /api/auth/verify-otp - should succeed with valid OTP from database', async () => {
      // Find generated challenge
      const challenge = await prisma.otpChallenge.findFirst({
        where: { phoneNumber: testPhoneUserA, verified: false },
        orderBy: { createdAt: 'desc' },
      });
      expect(challenge).toBeDefined();

      // In test mode we also know we can verify by retrieving or testing with correct mock
      // Let's create an OTP with known value for testing
      const bcrypt = await import('bcrypt');
      const testOtp = '123456';
      await prisma.otpChallenge.update({
        where: { id: challenge!.id },
        data: { hashedOtp: await bcrypt.hash(testOtp, 10) },
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhoneUserA, otp: testOtp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.phoneNumber).toBe(testPhoneUserA);

      tokenUserA = res.body.token;
      userAId = res.body.user.id;
    });

    it('POST /api/auth/verify-otp - should reject reuse of verified OTP (single-use)', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhoneUserA, otp: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/No active OTP request/);
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userAId);
      expect(res.body.user.phoneNumber).toBe(testPhoneUserA);
    });

    it('GET /api/auth/me - should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Loan Management and Ownership Security', () => {
    let loan1Id: string;
    let overdueLoanId: string;

    beforeAll(async () => {
      // Create user B for ownership testing
      const userB = await prisma.user.create({
        data: { phoneNumber: testPhoneUserB },
      });
      userBId = userB.id;
      const jwtUtil = await import('../utils/jwt');
      tokenUserB = jwtUtil.generateToken({ id: userB.id, phoneNumber: userB.phoneNumber });
    });

    it('POST /api/loans - should reject non-positive amounts', async () => {
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          friendName: 'Deepak',
          amount: -500,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.issues[0].message).toMatch(/greater than zero/);
    });

    it('POST /api/loans - should create a valid loan for User A', async () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          friendName: 'Rahul Mehta',
          amount: 2500.5,
          dueDate: futureDate,
          notes: 'Groceries share',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.friendName).toBe('Rahul Mehta');
      expect(res.body.data.amount).toBe(2500.5);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.isOverdue).toBe(false);

      loan1Id = res.body.data.id;
    });

    it('POST /api/loans - should create an overdue loan (past due date)', async () => {
      const pastDate = new Date(Date.now() - 3 * 86400000).toISOString();
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          friendName: 'Sneha Kapoor',
          amount: 1000,
          dueDate: pastDate,
          notes: 'Cab bill',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('OVERDUE');
      expect(res.body.data.isOverdue).toBe(true);
      expect(res.body.data.daysOverdue).toBeGreaterThanOrEqual(2);

      overdueLoanId = res.body.data.id;
    });

    it('GET /api/loans - User B should NOT see User A loans (Ownership Isolation)', async () => {
      const res = await request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('GET /api/loans/:id - User B should get 404 when trying to access User A loan', async () => {
      const res = await request(app)
        .get(`/api/loans/${loan1Id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/access denied/i);
    });

    it('PATCH /api/loans/:id/repay - User B cannot repay User A loan', async () => {
      const res = await request(app)
        .patch(`/api/loans/${loan1Id}/repay`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(404);
    });

    it('GET /api/summary - should calculate accurate financial totals for User A', async () => {
      const res = await request(app)
        .get('/api/summary')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalLent).toBe(3500.5); // 2500.50 + 1000
      expect(res.body.data.totalRepaid).toBe(0);
      expect(res.body.data.overdueAmount).toBe(1000); // Sneha Kapoor is past due
      expect(res.body.data.overdueCount).toBe(1);
    });

    it('PATCH /api/loans/:id/repay - User A marks overdue loan as repaid', async () => {
      const res = await request(app)
        .patch(`/api/loans/${overdueLoanId}/repay`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REPAID');
      expect(res.body.data.repaidAt).toBeDefined();
    });

    it('PATCH /api/loans/:id/repay - should reject repeated repayment of already repaid loan', async () => {
      const res = await request(app)
        .patch(`/api/loans/${overdueLoanId}/repay`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already been marked as repaid/);
    });

    it('GET /api/summary - should reflect updated totalRepaid and overdueAmount = 0', async () => {
      const res = await request(app)
        .get('/api/summary')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalLent).toBe(3500.5);
      expect(res.body.data.totalRepaid).toBe(1000); // 1000 repaid
      expect(res.body.data.overdueAmount).toBe(0); // None overdue now!
      expect(res.body.data.repaidCount).toBe(1);
      expect(res.body.data.overdueCount).toBe(0);
    });
  });
});
