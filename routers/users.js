const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js')
const emailer = require('../config/email.js')

// Enregistrer un nouvel usager 
router.route("/register")
    .post(async (req, res) => {
        const { email, password } = req.body;
        
        try {
            if(!email || !password) {
                res.status(400).json(Response.badRequest("Il manque un courriel ou un mot de passe"));
                exit();
            }

            const conn = db.getConnection();

            const existingUser = await conn.collection('users').findOne({ email });

            if(existingUser) {
                res.status(400).json(Response.badRequest("L'utilisateur existe déja"));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            conn.collection('users').insertOne({ email, password: hashedPassword });

            emailer.registerConfirmation(email)

            res.json(Response.ok('Utilisateur créé avec succès'));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Connection d'un utilisateur
router.route("/login")
    .post(async (req, res) => {
        const { email, password } = req.body;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }
        
    });

// Réinitialiser le mot de passe
router.route("/reset-password")
    .post(async (req, res) => {
         const { email } = req.body;
        
         try {
             
             // CODE HERE ...
             res.json(Response.ok(result));
             //res.status(404).json(Response.notFound("MESSAGE"));
 
         } catch (error) {
             res.status(500).json(Response.serverError(error.message));
         }
        
    });

// Changer le mot de passe
router.route("/change-password")
    .post(async (req, res) => {
        const { email, oldPassword, newPassword } = req.body;
        
        try {
            
            // CODE HERE ...
            res.json(Response.ok(result));
            //res.status(404).json(Response.notFound("MESSAGE"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }
        
    });

module.exports = router;