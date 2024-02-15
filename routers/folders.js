const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js')
const { ObjectId } = require('mongodb');

// Créer un nouveau dossier
router.route("/create")
    .post(async (req, res) => {
        const { userId, longText } = req.body;

        //Ajouter un folder à un utilisateur 
        try {
            if (!userId || !longText) {
                throw new Error("il manque un texte ou un id dutilisateur");
            }
            //Trouver un utilisateur par son ID
            const conn = db.getConnection();
            const existingUser = await conn.collection('users').findOne({ _id: new ObjectId(userId) });
            if (!existingUser) {
                throw new Error("l'utilisateur est incorrect");
            }
            await conn.collection('folders').insertOne({ userId: new ObjectId(userId), longText });
            res.json(Response.ok("Dossier créé"));

        } catch (error) {
            if (error.message.startsWith("il manque un texte ou un id dutilisateur")) {
                return res.status(400).json(Response.badRequest(error.message));
            }
            if (error.message.startsWith("l'utilisateur est incorrect")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));

        }
    });




// Récupérer un dossier par ID
router.route("/getById/:folderId")
    .get(async (req, res) => {
        const { folderId } = req.params;

        try {
            //Trouver un folder selon son id 
            const conn = db.getConnection();
            const folder = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
            if (!folder) {
                throw new Error("Dossier non trouvé");
            }
            res.json(Response.ok(folder));

        } catch (error) {
            if (error.message.startsWith("Dossier non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Récupérer les dossiers d'un utilisateur
router.route("/getByUserId/:userId")
    .get(async (req, res) => {
        const { userId } = req.params;

        try {

            //Trouver les folders d'un utilisateur  en fonction de son Id
            const conn = db.getConnection();
            const userFolders = await conn.collection('folders').find({ userId: userId }).toArray();
            if (!userFolders) {
                throw new Error("Aucun dossier trouvé");
            }
            res.json(Response.ok(userFolders));


        } catch (error) {
            if (error.message.startsWith("Aucun dossier trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Dupliquer un dossier
router.route("/duplicate/:folderId")
    .post(async (req, res) => {
        const { folderId } = req.params;

        try {
            //Trouver le folder a dupliquer 
            const conn = db.getConnection();
            const folderToDuplicate = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
            if (!folderToDuplicate) {
                throw new Error("Dossier non trouvé");
            }
            //Suppression du id du folder pour ne pas le répliquer 
            delete folderToDuplicate._id;
            //Ajout du duplicata
            const newFolder = await conn.collection('folders').insertOne({ ...folderToDuplicate });
            res.json(Response.ok("Dossier dupliqué"));

        } catch (error) {
            if (error.message.startsWith("Aucun dossier trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Copier un dossier d'un autre utilisateur
router.route("/copy/:folderId")
    .post(async (req, res) => {
        const { folderId } = req.params;
        const { newUserId } = req.body;
        console.log(folderId);
        try {
            //Trouver le folder a dupliquer 
            const conn = db.getConnection();
            const folderToDuplicate = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
            if (!folderToDuplicate) {
                throw new Error("Dossier non trouvé");
            }
            console.log(folderToDuplicate);
            //Suppression du id du folder pour ne pas le répliquer 
            delete folderToDuplicate._id;
            //Ajout du duplicata
            await conn.collection('folders').insertOne({ ...folderToDuplicate, userId: new ObjectId(newUserId) });
            res.json(Response.ok("Dossier dupliqué avec succès pour un autre utilisateur"));

        } catch (error) {
            if (error.message.startsWith("Aucun dossier trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });
    router.route("/delete/:folderId")
    .delete(async (req, res) => {
        const { folderId } = req.params;

        try {
            // Trouver le dossier à supprimer
            const conn = db.getConnection();
            const folderToDelete = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
            if (!folderToDelete) {
                throw new Error("Dossier non trouvé");
            }

            // Supprimer le dossier de la base de données
            await conn.collection('folders').deleteOne({ _id: new ObjectId(folderId) });
            res.json(Response.ok("Dossier supprimé avec succès"));

        } catch (error) {
            if (error.message.startsWith("Dossier non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }
    });
module.exports = router;