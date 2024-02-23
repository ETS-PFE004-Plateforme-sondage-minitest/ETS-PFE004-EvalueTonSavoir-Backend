const db = require('../config/db.js')
const { ObjectId } = require('mongodb');

class Quiz {
    
    async create(title, content, folderId, userId) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const existingQuiz = await quizCollection.findOne({ title: title, folderId: folderId, userId: userId })

        if (existingQuiz) return null;

        const newQuiz = {
            folderId: folderId,
            userId: userId,
            title: title,
            content: content,
            created_at: new Date(),
            updated_at: new Date()
        }

        const result = await quizCollection.insertOne(newQuiz);

        return result.insertedId;
    }

    async getOwner(quizId) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const quiz = await quizCollection.findOne({ _id: new ObjectId(quizId) });

        return quiz.userId;
    }

    async getContent(quizId) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const quiz = await quizCollection.findOne({ _id: new ObjectId(quizId) });

        return quiz;
    }

    async delete(quizId) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const result = await quizCollection.deleteOne({ _id: new ObjectId(quizId) });

        if (result.deletedCount != 1) return false;

        return true;
    }

    async update(quizId, newTitle, newContent) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const result = await quizCollection.updateOne({ _id: new ObjectId(quizId) }, { $set: { title: newTitle, content: newContent } });

        if (result.modifiedCount != 1) return false;

        return true
    }

    async move(quizId, newFolderId) {
        await db.connect()
        const conn = db.getConnection();

        const quizCollection = conn.collection('files');

        const result = await quizCollection.updateOne({ _id: new ObjectId(quizId) }, { $set: { folderId: newFolderId } });

        if (result.modifiedCount != 1) return false;

        return true
    }
    
}

module.exports = new Quiz;