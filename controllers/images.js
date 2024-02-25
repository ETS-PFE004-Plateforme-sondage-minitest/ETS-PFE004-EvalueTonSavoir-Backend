const Response = require('../helpers/Response.js');

const model = require('../models/images.js');

class ImagesController {

    async upload(req, res) {
        const file = req.file;

        if (!file) {
            return Response.badRequest(res, 'An image is required.');
        }

        try {
            const id = await model.upload(file, req.user.userId);

            return Response.ok(res, { id: id });
        }
        catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }

    }

    async get(req, res) {
        const { id } = req.params;

        if (!id) {
            return Response.badRequest(res, "An image id is required.");
        }

        try {
            const image = await model.get(id);

            if (!image) {
                return Response.notFound(res, 'Image not found.');
            }

            // Set Headers for display in browser
            res.setHeader('Content-Type', image.mime_type);
            res.setHeader('Content-Disposition', 'inline; filename=' + image.file_name);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.send(image.file_content);
        }
        catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

}

module.exports = new ImagesController;