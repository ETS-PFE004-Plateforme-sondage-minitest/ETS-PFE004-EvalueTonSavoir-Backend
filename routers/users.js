const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js');
const emailer = require('../config/email.js');
const bcrypt = require('bcrypt');
const jwt = require('../config/jwtToken.js');

async function login(email, password) {
    await db.connect()
    const conn = db.getConnection();

    const userCollection = conn.collection('users');

    const user = await userCollection.findOne({ email: email });

    if (!user) {
        return false;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return false;
    }

    return user;
}

router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(Response.badRequest("Email and password are required."));
    }

    try {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const existingUser = await userCollection.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json(Response.badRequest("User already exists."));
        }

        const newUser = {
            email: email,
            password: await bcrypt.hash(password, 10),
            created_at: new Date()
        };

        const insertResult = await userCollection.insertOne(newUser);

        emailer.registerConfirmation(email)

        return res.status(200).json(Response.ok('Utilisateur créé avec succès'));
    }
    catch (e) {
        return res.status(505).json(Response.serverError(""));
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(Response.badRequest("Email and password are required."));
    }

    try {
        const user = await login(email, password);

        if (!user) {
            return res.status(400).json(Response.badRequest("Email and password does not match."));
        }

        const token = jwt.create(email);

        return res.status(200).json(Response.ok(
            {
                token: token,
                id: user.email
            }));
    }
    catch (e) {
        return res.status(505).json(Response.serverError(""));
    }

});

router.post("/reset-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(Response.badRequest("Email is required."));
    }

    try {
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const result = await userCollection.updateOne({ email }, { $set: { password: hashedPassword } });

        if (result.modifiedCount != 1) {
            throw new Error("something whent wrong while updating password")
        }

        emailer.newPasswordConfirmation(email, newPassword);

        return res.status(400).json(Response.ok("Nouveau mot de passe envoyé par courriel"));

    } catch (error) {
        return res.status(505).json(Response.serverError(""));
    }

});

router.post("/change-password", jwt.authenticateToken, async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json(Response.badRequest("Email, oldPassword and newPassword are required."));
    }

    try {
        const user = await login(email, oldPassword);

        if (!user) {
            return res.status(400).json(Response.badRequest("Email and password does not match."));
        }

        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await userCollection.updateOne({ email }, { $set: { password: hashedPassword } });

        if (result.modifiedCount != 1) {
            throw new Error("something whent wrong while updating password")
        }

        return res.status(400).json(Response.ok("mot de passe changé avec succè"));

    } catch (error) {
        return res.status(505).json(Response.serverError(""));
    }

});

// router.delete("/delete-user", jwt.authenticateToken, async (req, res) => {
//         const { email, password } = req.body;

//         try {
//             const conn = db.getConnection();
//             const user = await conn.collection('users').findOne({ email });
//             if (!user) {
//                 throw new Error("L'utilisateur n'existe pas");
//             }
//             // Vérifier si le mot de passe est correct
//             const passwordMatch = await bcrypt.compare(password, user.password);
//             if (!passwordMatch) {
//                 throw new Error("Mot de passe incorrect");
//             }

//             // Supprimer l'utilisateur de la base de données
//             await conn.collection('users').deleteOne({ email });
//             res.json(Response.ok("Utilisateur supprimé avec succès"));

//         } catch (error) {
//             if (error.message === "L'utilisateur n'existe pas" || error.message === "Mot de passe incorrect") {
//                 return res.status(404).json(Response.badRequest(error.message));
//             }
//             res.status(500).json(Response.serverError("Oups"));
//         }
//     });

module.exports = router;