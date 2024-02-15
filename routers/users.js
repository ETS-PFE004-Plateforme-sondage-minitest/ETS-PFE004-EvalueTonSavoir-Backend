const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js');
const emailer = require('../config/email.js');
const bcrypt = require('bcrypt');


// Enregistrer un nouvel usager 
router.route("/register")
    .post(async (req, res) => {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                throw new Error("Il manque un courriel ou un mot de passe");
            }
            const conn = db.getConnection();
            const existingUser = await conn.collection('users').findOne({ email });

            if (existingUser) {
                throw new Error("L'utilisateur existe déjà");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            conn.collection('users').insertOne({ email, password: hashedPassword });

            emailer.registerConfirmation(email)

            res.json(Response.ok('Utilisateur créé avec succès'));

        } catch (error) {
            if (error.message.startsWith("Il manque un courriel")) {
                return res.status(400).json(Response.badRequest(error.message));
            }

            if (error.message.startsWith("L'utilisateur existe déjà")) {
                return res.status(400).json(Response.badRequest(error.message));
            }

            res.status(500).json(Response.serverError(error.message));
        }

    });

// Connection d'un utilisateur
router.route("/login")
    .post(async (req, res) => {
        const { email, password } = req.body;

        try {

            if (!req.body || !req.body.email || !req.body.password) {
                throw new Error("Il manque un courriel ou un mot de passe");
            }
            const { email, password } = req.body;
            //Trouver l'usager dans la BD
            const conn = db.getConnection();
            const user = await conn.collection('users').findOne({ email });

            if (!user) {
                throw new Error("l'utilisateur ou le mot de passe son incorrect");
            }
            //Vérification de la correspondance du mot de passe 
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error("l'utilisateur ou le mot de passe son incorrect");
            }

            res.json(Response.ok("Connection réussi"));

        } catch (error) {
            if (error.message.startsWith("Il manque un courriel ou un mot de passe")) {
                return res.status(400).json(Response.badRequest(error.message));
            }
            if (error.message.startsWith("l'utilisateur ou le mot de passe son incorrect")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Réinitialiser le mot de passe
router.route("/reset-password")
    .post(async (req, res) => {
        const { email } = req.body;

        try {
            const newPassword = Math.random().toString(36).slice(-8); // Générer un nouveau mot de passe temporaire
            const hashedPassword = await bcrypt.hash(newPassword, 10); // Hasher le nouveau mot de passe
            // Mettre à jour le mot de passe de l'utilisateur 
            const conn = db.getConnection();
            await conn.collection('users').updateOne({ email }, { $set: { password: hashedPassword } });

            //envoi d'un courriel à l'usager pour confirmer le changement du mot de passe  
            emailer.newPasswordConfirmation(email, newPassword);
            res.json(Response.ok("Nouveau mot de passe envoyé par courriel"));

        } catch (error) {
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Changer le mot de passe
router.route("/change-password")
    .post(async (req, res) => {
        const { email, oldPassword, newPassword } = req.body;

        try {
            const conn = db.getConnection();
            const user = await conn.collection('users').findOne({ email });
            if (!user) {
                throw new Error("l'utilisateur ou le mot de passe son incorrect");
            }
            //comparer le mot de passe actuel avec celui donner par l'utilisateur
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordMatch) {
                throw new Error("l'utilisateur ou le mot de passe son incorrect");
            }
            // Hasher le nouveau mot de passe
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            //Chnager le mot de passe dans la BD
            await conn.collection('users').updateOne({ email }, { $set: { password: hashedNewPassword } });

            res.json(Response.ok("mot de passe changé avec succès"));

        } catch (error) {
            if (error.message.startsWith("l'utilisateur ou le mot de passe son incorrect")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });
    router.route("/delete-user")
    .delete(async (req, res) => {
        const { email, password } = req.body;

        try {
            const conn = db.getConnection();
            const user = await conn.collection('users').findOne({ email });
            if (!user) {
                throw new Error("L'utilisateur n'existe pas");
            }
            // Vérifier si le mot de passe est correct
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error("Mot de passe incorrect");
            }

            // Supprimer l'utilisateur de la base de données
            await conn.collection('users').deleteOne({ email });
            res.json(Response.ok("Utilisateur supprimé avec succès"));

        } catch (error) {
            if (error.message === "L'utilisateur n'existe pas" || error.message === "Mot de passe incorrect") {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }
    });
module.exports = router;