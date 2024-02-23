const db = require('../config/db.js')
const { ObjectId } = require('mongodb');

class Images {

    async upload(file, userId) {
        await db.connect()
        const conn = db.getConnection();

        const imagesCollection = conn.collection('images');

        const newImage = {
            userId: userId,
            file_name: file.originalname,
            file_content: file.buffer.toString('base64'),
            mime_type: file.mimetype,
            created_at: new Date()
        };

        const result = await imagesCollection.insertOne(newImage);

        return result.insertedId;
    }

    async get(id) {
        await db.connect()
        const conn = db.getConnection();

        const imagesCollection = conn.collection('images');

        const result = await imagesCollection.findOne({ _id: new ObjectId(id) });

        if (!result) return null;

        return {
            file_name: result.file_name,
            file_content: Buffer.from(result.file_content, 'base64'),
            mime_type: result.mime_type
        };
    }

}

module.exports = new Images;