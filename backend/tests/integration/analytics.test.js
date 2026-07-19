const request = require('supertest');
const express = require('express');
const analyticsRoute = require('../../src/routes/analytics');

const app = express();
app.use('/api/analytics', analyticsRoute);

describe('GET /api/analytics', () => {
  test('returns 200 with gate status data', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.gateStatus)).toBe(true);
  });
});