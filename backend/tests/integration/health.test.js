const request = require('supertest');
const express = require('express');
const healthRoute = require('../../src/routes/health');

const app = express();
app.use('/api/health', healthRoute);

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('includes a timestamp field', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('timestamp');
  });
});