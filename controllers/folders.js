const Response = require('../helpers/Response.js');

const model = require('../models/folders.js');

class FoldersController {

    /***
     * Basic queries
     */
    async create(req, res) {
        const { title } = req.body;

        if (!title) {
            return Response.badRequest(res, "Title is required.");
        }

        try {
            const result = await model.create(title, req.user.userId);

            if (!result) {
                return Response.badRequest(res, "Folder already exists.");
            }

            return Response.ok(res, "Folder Created successfully.");

        } catch(e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async getUserFolders(req, res) {

        try {
            const folders = await model.getUserFolders(req.user.userId);

            if (!folders) {
                throw new Error("Aucun dossier trouvé");
            }

            return Response.ok(res, folders);
    
        } catch(e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async getFolderContent(req, res) {
        const { folderId } = req.params;

        if (!folderId) {
            return Response.badRequest(res, "FolderId is required.");
        }

        try {
            // Is this folder mine
            const owner = await model.getFolderOwner(folderId);

            if(owner != req.user.userId) {
                return Response.notFound(res, 'No folder with this id was found.');
            }

            const content = await model.getContent(folderId);

            if(!content) {
                throw new Error(res, "Something whent wrong while updating password.")
            }

            return Response.ok(res, content);

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async delete(req, res) {
        const { folderId } = req.params;

        if (!folderId) {
            return Response.badRequest(res, "FolderId is required.");
        }

        try {
            // Is this folder mine
            const owner = await model.getFolderOwner(folderId);

            if(owner != req.user.userId) {
                return Response.notFound(res, 'No folder with this id was found.');
            }

            const result = await model.delete(folderId);

            if (!result) {
                throw new Error("something whent wrong while deleting folder.")
            }

            return Response.ok(res, "Dossier supprimé avec succès");
    
        } catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

    async rename(req, res) {
        const { folderId, newTitle } = req.body;

        if (!folderId || !newTitle) {
            return Response.badRequest(res, "FolderId is required.");
        }

        try {
            // Is this folder mine
            const owner = await model.getFolderOwner(folderId);

            if(owner != req.user.userId) {
                return Response.notFound(res, 'No folder with this id was found.');
            }

            const result = await model.rename(folderId, newTitle);

            if (!result) {
                throw new Error("something whent wrong while renaming folder.")
            }

            return Response.ok(res, "Dossier renomé avec succès");

        } catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }


    /**
     * Sharing and advance queries
     */
    async duplicate(req, res) {
        const { folderId, newTitle } = req.body;

        if (!folderId || !newTitle) {
            return Response.badRequest(res, "FolderId and newTitle are required.");
        }

        return Response.serverError(res, "NOT IMPLEMENTED");

        // try {
        //     //Trouver le folder a dupliquer 
        //     const conn = db.getConnection();
        //     const folderToDuplicate = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
        //     if (!folderToDuplicate) {
        //         throw new Error("Dossier non trouvé");
        //     }
        //     //Suppression du id du folder pour ne pas le répliquer 
        //     delete folderToDuplicate._id;
        //     //Ajout du duplicata
        //     const newFolder = await conn.collection('folders').insertOne({ ...folderToDuplicate });
        //     res.json(Response.ok("Dossier dupliqué"));
    
        // } catch (error) {
        //     if (error.message.startsWith("Aucun dossier trouvé")) {
        //         return res.status(404).json(Response.badRequest(error.message));
        //     }
        //     res.status(500).json(Response.serverError(error.message));
        // }
    }

    async copy(req, res) {
        const { folderId, newTitle } = req.body;

        if (!folderId || !newTitle) {
            return Response.badRequest(res, "FolderId and newTitle are required.");
        }

        return Response.serverError(res, "NOT IMPLEMENTED");



        // const { folderId } = req.params;
        // const { newUserId } = req.body;
        // console.log(folderId);
        // try {
        //     //Trouver le folder a dupliquer 
        //     const conn = db.getConnection();
        //     const folderToDuplicate = await conn.collection('folders').findOne({ _id: new ObjectId(folderId) });
        //     if (!folderToDuplicate) {
        //         throw new Error("Dossier non trouvé");
        //     }
        //     console.log(folderToDuplicate);
        //     //Suppression du id du folder pour ne pas le répliquer 
        //     delete folderToDuplicate._id;
        //     //Ajout du duplicata
        //     await conn.collection('folders').insertOne({ ...folderToDuplicate, userId: new ObjectId(newUserId) });
        //     res.json(Response.ok("Dossier dupliqué avec succès pour un autre utilisateur"));
    
        // } catch (error) {
        //     if (error.message.startsWith("Aucun dossier trouvé")) {
        //         return res.status(404).json(Response.badRequest(error.message));
        //     }
        //     res.status(500).json(Response.serverError(error.message));
        // }
    }

}

module.exports = new FoldersController;