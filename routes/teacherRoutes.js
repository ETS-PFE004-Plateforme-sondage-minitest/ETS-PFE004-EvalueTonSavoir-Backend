const express = require('express');
const router = express.Router();
const configs = require('../configs/config');

router.get('/send-next-question', (req, res) => {
  res.send(configs.getPassword());
});

router.post('/set-room-password', (req, res) => {
    const password = req.body.password;
    configs.changePassword(password);
});

module.exports = router;
