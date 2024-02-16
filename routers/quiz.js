const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js');
const { ObjectId } = require('mongodb');
const jwt = require('../config/jwtToken.js');

// Créer un nouveau quiz
router.post("/create", jwt.authenticateToken, async (req, res) => {
    const { userId, quiz } = req.body;

    try {
        if (!userId || !quiz) {
            throw new Error("Il manque l'identifiant de l'utilisateur ou le quiz.");
        }

        const { id, title, questions = [] } = quiz;

        // Assurez-vous que l'utilisateur existe
        const conn = db.getConnection();
        const existingUser = await conn.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!existingUser) {
            throw new Error("L'utilisateur est incorrect.");
        }

        // Insérer le quiz dans la base de données avec l'ID fourni par TypeScript
        await conn.collection('quiz').insertOne({ _id: id, userId: new ObjectId(userId), title, questions });

        res.json(Response.ok("Quiz créé avec succès."));

    } catch (error) {
        if (error.message.startsWith("Il manque l'identifiant de l'utilisateur ou le quiz.")) {
            return res.status(400).json(Response.badRequest(error.message));
        }
        if (error.message.startsWith("L'utilisateur est incorrect.")) {
            return res.status(404).json(Response.badRequest(error.message));
        }
        res.status(500).json(Response.serverError(error.message));
    }
});

// Récupérer un dossier par ID
router.get("/getById/:quizId", jwt.authenticateToken, async (req, res) => {
    const { quizId } = req.params;

    try {
        //Trouver un folder selon son id 
        const conn = db.getConnection();
        const quiz = await conn.collection('quiz').findOne({ _id: quizId });
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

// Mettre à jour un quiz par ID
router.put("/update/:quizId", jwt.authenticateToken, async (req, res) => {
    const { quizId } = req.params;
    const { userId, title, questions = [] } = req.body;

    try {
        if (!userId) {
            throw new Error("Il manque l'identifiant de l'utilisateur");
        }

        // Assurez-vous que l'utilisateur existe
        const conn = db.getConnection();
        const existingUser = await conn.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!existingUser) {
            throw new Error("L'utilisateur est incorrect.");
        }

        // Mettre à jour le quiz dans la base de données
        await conn.collection('quiz').updateOne(
            { _id: quizId }, // Critère de recherche
            { $set: { userId: new ObjectId(userId), title, questions } } // Nouvelles valeurs à mettre à jour
        );

        res.json(Response.ok("Quiz mis à jour avec succès."));

    } catch (error) {
        if (error.message.startsWith("Il manque l'identifiant de l'utilisateur")) {
            return res.status(400).json(Response.badRequest(error.message));
        }
        if (error.message.startsWith("L'utilisateur est incorrect.")) {
            return res.status(404).json(Response.badRequest(error.message));
        }
        res.status(500).json(Response.serverError(error.message));
    }
});

// Récupérer les dossiers d'un utilisateur
router.get("/getByfolderId/:folderId", jwt.authenticateToken, async (req, res) => {
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

router.get("/getAllByUserId/:userId", jwt.authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        // console.log(userId);
        // Find all quizzes of a user based on their ID
        const conn = db.getConnection();
        const userQuizzes = await conn.collection('quiz').find({ userId: new ObjectId(userId) }).toArray();
        // console.log(userQuizzes);

        if (userQuizzes.length === 0) {
            throw new Error("No quizzes found for this user");
        }

        res.status(200).json({ quizzes: userQuizzes }); // Return quizzes as part of a JSON object

    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(404).json({ error: error.message }); // Return error message in JSON format
    }
});

// Dupliquer un dossier
router.post("/duplicate/:quizId", jwt.authenticateToken, async (req, res) => {
    const { quizId } = req.params;
    const { quiz } = req.body;

    try {
        //Trouver le quizz a dupliquer 
        const conn = db.getConnection();
        const quiztoduplicate = await conn.collection('quiz').findOne({ _id: quizId });
        if (!quiztoduplicate) {
            throw new Error("quiz non trouvé");
        }

        //changement du id du folder pour ne pas le répliquer 
        const { _id, title, questions = [] } = quiz;
        console.log(_id);
        quiztoduplicate._id = _id;
        quiztoduplicate.title = title;

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
router.post("/copy/:quizId", jwt.authenticateToken, async (req, res) => {
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

router.delete("/delete/:quizId", jwt.authenticateToken, async (req, res) => {
    const { quizId } = req.params;

    try {
        // Trouver le quiz à supprimer
        const conn = db.getConnection();
        const quizToDelete = await conn.collection('quiz').findOne({ _id: quizId });
        if (!quizToDelete) {
            throw new Error("Quiz non trouvé");
        }
        // Supprimer le quiz
        await conn.collection('quiz').deleteOne({ _id: quizId });
        res.json(Response.ok("Quiz supprimé avec succès"));

    } catch (error) {
        if (error.message.startsWith("Quiz non trouvé")) {
            return res.status(404).json(Response.badRequest(error.message));
        }
        res.status(500).json(Response.serverError(error.message));
    }
});

router.put("/changeQuizFolder/:quizId/:newFolderId", jwt.authenticateToken, async (req, res) => {
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