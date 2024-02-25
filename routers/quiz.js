const express = require('express');
const router = express.Router();

const jwt = require('../config/jwtToken.js');
const quizController = require('../controllers/quiz.js')

router.post("/create", jwt.authenticate, quizController.create);
router.get("/get/:quizId", jwt.authenticate, quizController.get);
router.delete("/delete/:quizId", jwt.authenticate, quizController.delete);
router.put("/update", jwt.authenticate, quizController.update);
router.put("/move", jwt.authenticate, quizController.move);

router.post("/duplicate", jwt.authenticate, quizController.duplicate);
router.post("/copy/:quizId", jwt.authenticate, quizController.copy);

module.exports = router;