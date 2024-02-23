const express = require('express');
const router = express.Router();
const jwt = require('../config/jwtToken.js');

const foldersController = require('../controllers/folders.js')

router.post("/create", jwt.authenticate, foldersController.create);
router.get("/getUserFolders", jwt.authenticate, foldersController.getUserFolders);
router.get("/getFolderContent/:folderId", jwt.authenticate, foldersController.getFolderContent);
router.delete("/delete/:folderId", jwt.authenticate, foldersController.delete);
router.post("/rename", jwt.authenticate, foldersController.rename);

router.post("/duplicate", jwt.authenticate, foldersController.duplicate);
router.post("/copy/:folderId", jwt.authenticate, foldersController.copy);

module.exports = router;