const express = require('express');
const router = express.Router();
const Response = require('./response.js');
const db = require('../config/db.js')
const { ObjectId } = require('mongodb');
const jwt = require('../config/jwtToken.js');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload new image
router.post("/upload", jwt.authenticateToken, upload.single('image'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('An image is required.');
    }

    try {
        const binaryData = file.buffer.toString('base64');

        await db.connect()
        const conn = db.getConnection();

        const imagesCollection = conn.collection('images');

        const newImage = {
            file_name: file.originalname,
            file_content: binaryData,
            mime_type: file.mimetype,
            created_at: new Date()
        };

        const result = await imagesCollection.insertOne(newImage);
        console.log(file,result)

        const id = result.insertedId;

        return res.status(200).json(Response.ok({ id: id }));
    }
    catch (e) {
        console.log(e)
        return res.status(505).json(Response.serverError(""));
    }
});

// Get image
router.get("/get/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json(Response.badRequest("An image id is required."));
    }

    try {
        console.log("hello")
        await db.connect()
        const conn = db.getConnection();

        const imagesCollection = conn.collection('images');

        const result = await imagesCollection.findOne({ _id: new ObjectId(id) });

        if (!result) {
          return res.status(404).send(Response.notFound('Image not found.'));
        }

        const image = Buffer.from(result.file_content, 'base64');

        // Set Headers for display in browser
        res.setHeader('Content-Type', result.mime_type);
        res.setHeader('Content-Disposition', 'inline; filename='+ result.file_name);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(image);
    }
    catch (e) {
        console.log(e)
        return res.status(505).json(Response.serverError(""));
    }

});

module.exports = router;