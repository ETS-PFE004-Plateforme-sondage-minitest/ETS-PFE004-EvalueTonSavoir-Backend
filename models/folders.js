const db = require('../config/db.js')
const { ObjectId } = require('mongodb');

class Folders {

    async create(title, userId) {
        await db.connect()
        const conn = db.getConnection();

        const foldersCollection = conn.collection('folders');

        const existingFolder = await foldersCollection.findOne({ title: title, userId: userId });

        if (existingFolder) return null;

        const newFolder = {
            userId: userId,
            title: title,
            created_at: new Date()
        }

        const result = await foldersCollection.insertOne(newFolder);

        return result.insertedId;
    }

    async getUserFolders(userId) {
        await db.connect()
        const conn = db.getConnection();

        const foldersCollection = conn.collection('folders');

        const result = await foldersCollection.find({ userId: userId }).toArray();

        return result;
    }

    async getFolderOwner(folderId) {
        await db.connect()
        const conn = db.getConnection();

        const foldersCollection = conn.collection('folders');

        const folder = await foldersCollection.findOne({ _id: new ObjectId(folderId) });

        return folder.userId;
    }

    async getContent(folderId) {
        await db.connect()
        const conn = db.getConnection();

        const filesCollection = conn.collection('files');

        const result = await filesCollection.find({ folderId: folderId }).toArray();

        return result;
    }

    async delete(folderId) {
        await db.connect()
        const conn = db.getConnection();

        // Delete folder
        const foldersCollection = conn.collection('folders');

        const folderResult = await foldersCollection.deleteOne({ _id: new ObjectId(folderId) });

        if (folderResult.deletedCount != 1) return false;

        return true;
    }

    async rename(folderId, newTitle) {
        await db.connect()
        const conn = db.getConnection();

        const foldersCollection = conn.collection('folders');

        const result = await foldersCollection.updateOne({ _id: new ObjectId(folderId) }, { $set: { title: newTitle } })

        if (result.modifiedCount != 1) return false;

        return true
    }
}

module.exports = new Folders;