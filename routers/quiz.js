const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js');
const { ObjectId } = require('mongodb');

// Créer un nouveau quiz
router.route("/create")
    .post(async (req, res) => {
        const { userId, longText, folderId } = req.body;

        //Ajouter un quizz à un folder 
        try {
            if (!userId || !longText || !folderId) {
                throw new Error("il manque un texte, un id dutilisateur ou un dossier");
            }
            //Trouver un utilisateur par son ID
            const conn = db.getConnection();
            const existingUser = await conn.collection('users').findOne({ _id: new ObjectId(userId) });
            const existingfolder = await conn.collection('folders').findOne({ _id: new ObjectId(folderId), userId: new ObjectId(userId) });
            if (!existingUser) {
                throw new Error("l'utilisateur est incorrect");
            }
            if (!existingfolder) {
                throw new Error("le dossier n'existe pas");
            }
            await conn.collection('quiz').insertOne({ userId: new ObjectId(userId), folderId, longText });
            res.json(Response.ok("quiz créé"));

        } catch (error) {
            if (error.message.startsWith("il manque un texte, un id dutilisateur ou un dossier")) {
                return res.status(400).json(Response.badRequest(error.message));
            }
            if (error.message.startsWith("l'utilisateur est incorrect")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            if (error.message.startsWith("le dossier n'existe pas")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));

        }



    });

// Récupérer un dossier par ID
router.route("/getById/:quizId")
    .get(async (req, res) => {
        const { quizId } = req.params;

        try {
            //Trouver un folder selon son id 
            const conn = db.getConnection();
            const quiz = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
            if (!quiz) {
                throw new Error("Quiz non trouvé");
            }
            res.json(Response.ok(quiz));

        } catch (error) {
            if (error.message.startsWith("Quiz non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }
    });

// Récupérer les dossiers d'un utilisateur
router.route("/getByfolderId/:folderId")
    .get(async (req, res) => {
        const { folderId } = req.params;

        try {
            console.log(folderId);
            //Trouver les quiz d'un folder  en fonction de son Id
            const conn = db.getConnection();
            const FolderQuiz = await conn.collection('quiz').find({ folderId: folderId }).toArray();
            console.log(FolderQuiz);
            if (!FolderQuiz) {
                throw new Error("Aucun quiz trouvé");
            }
            res.json(Response.ok(FolderQuiz));


        } catch (error) {
            if (error.message.startsWith("Aucun quiz trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Dupliquer un dossier
router.route("/duplicate/:quizId")
    .post(async (req, res) => {
        const { quizId } = req.params;

        try {
            //Trouver le quizz a dupliquer 
            const conn = db.getConnection();
            const quiztoduplicate = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
            if (!quiztoduplicate) {
                throw new Error("quiz non trouvé");
            }
            //Suppression du id du folder pour ne pas le répliquer 
            delete quiztoduplicate._id;
            //Ajout du duplicata
            await conn.collection('quiz').insertOne({ ...quiztoduplicate });
            res.json(Response.ok("quiz dupliqué"));

        } catch (error) {
            if (error.message.startsWith("quiz non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });

// Copier un dossier d'un autre utilisateur
router.route("/copy/:quizId")
    .post(async (req, res) => {
        const { quizId } = req.params;
        const { newUserId } = req.body;

        try {
            //Trouver le quiz a dupliquer 
            const conn = db.getConnection();
            const quiztoduplicate = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
            if (!quiztoduplicate) {
                throw new Error("Quiz non trouvé");
            }
            console.log(quiztoduplicate);
            //Suppression du id du quiz pour ne pas le répliquer 
            delete quiztoduplicate._id;
            //Ajout du duplicata
            await conn.collection('quiz').insertOne({ ...quiztoduplicate, userId: new ObjectId(newUserId) });
            res.json(Response.ok("Dossier dupliqué avec succès pour un autre utilisateur"));

        } catch (error) {
            if (error.message.startsWith("Quiz non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }

    });
    router.route("/delete/:quizId")
    .delete(async (req, res) => {
        const { quizId } = req.params;

        try {
            // Trouver le quiz à supprimer
            const conn = db.getConnection();
            const quizToDelete = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
            if (!quizToDelete) {
                throw new Error("Quiz non trouvé");
            }
            // Supprimer le quiz
            await conn.collection('quiz').deleteOne({ _id: new ObjectId(quizId) });
            res.json(Response.ok("Quiz supprimé avec succès"));

        } catch (error) {
            if (error.message.startsWith("Quiz non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }
    });

    router.route("/changeQuizFolder/:quizId/:newFolderId")
    .put(async (req, res) => {
        const { quizId, newFolderId } = req.params;

        try {
            // Vérifier si les IDs de quiz et de dossier sont fournis
            if (!quizId || !newFolderId) {
                throw new Error("ID de quiz ou de dossier manquant");
            }

            // Vérifier si le quiz existe
            const conn = db.getConnection();
            const quiz = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
            if (!quiz) {
                throw new Error("Quiz non trouvé");
            }

            // Mettre à jour le dossier du quiz avec le nouvel ID de dossier
            await conn.collection('quiz').updateOne({ _id: new ObjectId(quizId) }, { $set: { folderId: newFolderId } });

            res.json(Response.ok("Dossier du quiz modifié avec succès"));
        } catch (error) {
            if (error.message.startsWith("ID de quiz ou de dossier manquant") || error.message.startsWith("Quiz non trouvé")) {
                return res.status(404).json(Response.badRequest(error.message));
            }
            res.status(500).json(Response.serverError(error.message));
        }
    });
module.exports = router;