const request = require('supertest');
const express = require('express');
const chatRoute = require('../../src/routes/chat');

const app = express();
app.use(express.json());
app.use('/api/chat', chatRoute);

describe('POST /api/chat', () => {
  test('returns 400 for empty message', async () => {
    const res = await request(app).post('/api/chat').send({ message: '' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 for missing message field', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.statusCode).toBe(400);
  });
});