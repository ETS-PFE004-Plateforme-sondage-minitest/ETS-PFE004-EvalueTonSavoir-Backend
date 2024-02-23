const Response = require('../helpers/Response.js');

const model = require('../models/quiz.js');
const folderModel = require('../models/folders.js');

class QuizController {

    async create(req, res) {
        const { title, content, folderId } = req.body;

        if (!title || !content || !folderId) {
            return Response.badRequest(res, "Title, content and folderId are required.");
        }

        try {
            // Is this folder mine
            const owner = await folderModel.getOwner(folderId);

            if (owner != req.user.userId) {
                return Response.notFound(res, 'No folder with this id was found.');
            }

            const result = await model.create(title, content, folderId, req.user.userId);

            if (!result) {
                return Response.badRequest(res, "Quiz already exists.");
            }

            return Response.ok(res, "Quiz Created successfully.");

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async get(req, res) {
        const { quizId } = req.params;

        if (!quizId) {
            return Response.badRequest(res, "quizId is required.");
        }

        try {

            const content = await model.getContent(quizId);

            if (!content) {
                throw new Error(res, "Something whent wrong while updating password.")
            }

            // Is this quiz mine
            if (content.userId != req.user.userId) {
                return Response.notFound(res, 'No quiz with this id was found.');
            }

            return Response.ok(res, content);

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async delete(req, res) {
        const { quizId } = req.params;

        if (!quizId) {
            return Response.badRequest(res, "quizId is required.");
        }

        try {
            // Is this quiz mine
            const owner = await model.getOwner(quizId);

            if (owner != req.user.userId) {
                return Response.notFound(res, 'No quiz with this id was found.');
            }

            const result = await model.delete(quizId);

            if (!result) {
                throw new Error("something whent wrong while deleting quiz.")
            }

            return Response.ok(res, "Quiz supprimé avec succès");

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async update(req, res) {
        const { quizId, newTitle, newContent } = req.body;

        if (!newTitle || !newContent || !quizId) {
            return Response.badRequest(res, "newTitle, newContent and quizId are required.");
        }

        try {
            // Is this quiz mine
            const owner = await model.getOwner(quizId);

            if (owner != req.user.userId) {
                return Response.notFound(res, 'No quiz with this id was found.');
            }

            const result = await model.update(quizId, newTitle, newContent);

            if (!result) {
                throw new Error("something whent wrong while deleting quiz.")
            }

            return Response.ok(res, "Quiz mis à jours avec succès");

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async move(req, res) {
        const { quizId, newFolderId } = req.body;

        if (!quizId || !newFolderId) {
            return Response.badRequest(res, "QuizId and newFolderId are required.");
        }

        try {
            // Is this quiz mine
            const quizOwner = await model.getOwner(quizId);

            if (quizOwner != req.user.userId) {
                return Response.notFound(res, 'No quiz with this id was found.');
            }

            // Is this folder mine
            const folderOwner = await folderModel.getOwner(newFolderId);

            if (folderOwner != req.user.userId) {
                return Response.notFound(res, 'No folder with this id was found.');
            }

            const result = await model.move(quizId, newFolderId);

            if (!result) {
                throw new Error("something whent wrong while moving quiz.")
            }

            return Response.ok(res, "Quiz a été déplacé avec succès");
            
        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }

    }

    async duplicate(req, res) {
        const { quizId, newTitle } = req.body;

        if (!quizId || !newTitle) {
            return Response.badRequest(res, "QuizId and newTitle are required.");
        }

        return Response.serverError(res, "NOT IMPLEMENTED");
        // const { quizId } = req.params;
        // const { quiz } = req.body;

        // try {
        //     //Trouver le quizz a dupliquer 
        //     const conn = db.getConnection();
        //     const quiztoduplicate = await conn.collection('quiz').findOne({ _id: quizId });
        //     if (!quiztoduplicate) {
        //         throw new Error("quiz non trouvé");
        //     }

        //     //changement du id du folder pour ne pas le répliquer 
        //     const { _id, title, questions = [] } = quiz;
        //     console.log(_id);
        //     quiztoduplicate._id = _id;
        //     quiztoduplicate.title = title;

        //     //Ajout du duplicata
        //     await conn.collection('quiz').insertOne({ ...quiztoduplicate });
        //     res.json(Response.ok("quiz dupliqué"));

        // } catch (error) {
        //     if (error.message.startsWith("quiz non trouvé")) {
        //         return res.status(404).json(Response.badRequest(error.message));
        //     }
        //     res.status(500).json(Response.serverError(error.message));
        // }
    }

    async copy(req, res) {
        const { quizId, newTitle } = req.body;

        if (!quizId || !newTitle) {
            return Response.badRequest(res, "QuizId and newTitle are required.");
        }

        return Response.serverError(res, "NOT IMPLEMENTED");
        // const { quizId } = req.params;
        // const { newUserId } = req.body;

        // try {
        //     //Trouver le quiz a dupliquer 
        //     const conn = db.getConnection();
        //     const quiztoduplicate = await conn.collection('quiz').findOne({ _id: new ObjectId(quizId) });
        //     if (!quiztoduplicate) {
        //         throw new Error("Quiz non trouvé");
        //     }
        //     console.log(quiztoduplicate);
        //     //Suppression du id du quiz pour ne pas le répliquer 
        //     delete quiztoduplicate._id;
        //     //Ajout du duplicata
        //     await conn.collection('quiz').insertOne({ ...quiztoduplicate, userId: new ObjectId(newUserId) });
        //     res.json(Response.ok("Dossier dupliqué avec succès pour un autre utilisateur"));

        // } catch (error) {
        //     if (error.message.startsWith("Quiz non trouvé")) {
        //         return res.status(404).json(Response.badRequest(error.message));
        //     }
        //     res.status(500).json(Response.serverError(error.message));
        // }
    }

}

module.exports = new QuizController;