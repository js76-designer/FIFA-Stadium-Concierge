const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoute = require('./routes/health');
const helmet = require('helmet');
const analyticsRoute = require('./routes/analytics');


const chatRoute = require('./routes/chat');

if (!env.LLM_API_KEY) {
    console.error('FATAL: LLM_API_KEY is not set.');
    process.exit(1);
  }

const app = express();


app.use(cors());
app.use(express.json());
app.use(helmet());
app.use('/api/analytics', analyticsRoute);
app.use('/api/health', healthRoute);
app.use(cors({ origin: ['http://localhost:5173', 'https://fifa-stadium-concierge.vercel.app'] }));
app.use('/api/chat', chatRoute);
app.use(cors({ origin: 'http://localhost:5173' }));

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});