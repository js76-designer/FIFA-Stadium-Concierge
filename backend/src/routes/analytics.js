const express = require('express');
const router = express.Router();

// Mocked operational intelligence data — in production this would aggregate
// real query logs and gate sensor data. Included to demonstrate the pattern.
router.get('/', (req, res) => {
  res.status(200).json({
    generatedAt: new Date().toISOString(),
    gateStatus: [
      { gate: 'Gate A', capacity: '64%', status: 'normal' },
      { gate: 'Gate B', capacity: '91%', status: 'congested' },
      { gate: 'Gate C', capacity: '48%', status: 'normal' },
      { gate: 'Gate D', capacity: '72%', status: 'normal' },
    ],
    topFanQuestions: [
      { question: 'How do I get to Gate B?', count: 142 },
      { question: 'Where is accessible seating?', count: 89 },
      { question: 'Shuttle bus schedule', count: 76 },
    ],
    note: 'Demo data — in production this would be computed from live query logs and gate sensor feeds.',
  });
});

module.exports = router;