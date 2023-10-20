const express = require('express');
const router = express.Router();

router.get('/connect', (req, res) => {
  res.send('Connect route');
});

router.post('/answer', (req, res) => {
    res.send('answer route');
  });

module.exports = router;