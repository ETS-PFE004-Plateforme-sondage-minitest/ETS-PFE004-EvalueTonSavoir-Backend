const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js')

// Créer un nouveau quiz
router.route("/create")
    .post(async (req, res) => {
        const { userId, longText } = req.body;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Récupérer un dossier par ID
router.route("/getById/:quizId")
    .get(async (req, res) => {
        const { quizId } = req.params;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Récupérer les dossiers d'un utilisateur
router.route("/getByUserId/:userId")
    .get(async (req, res) => {
        const { userId } = req.params;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Dupliquer un dossier
router.route("/duplicate/:quizId")
    .post(async (req, res) => {
        const { quizId } = req.params;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });   

// Copier un dossier d'un autre utilisateur
router.route("/copy/:quizId")
    .post(async (req, res) => {
        const { quizId } = req.params;
        const { newUserId } = req.body;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

module.exports = router;