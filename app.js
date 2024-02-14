// Import modules
const express = require("express");
const http = require("http");
const dotenv = require('dotenv')


const { setupWebsocket } = require("./socket/socket");
const { Server } = require("socket.io");
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

//import routers
const userRouter = require('./routers/users.js');
const folderRouter = require('./routers/folders.js');
const quizRouter = require('./routers/quiz.js');

// Setup environement
dotenv.config();

// Start app
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const configureServer = (httpServer) => {
  return new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
};


// Start sockets
const server = http.createServer(app);
const io = configureServer(server);

setupWebsocket(io);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Create routes
app.use('/user', userRouter);
app.use('/folder', folderRouter);
app.use('/quiz', quizRouter);


// Start server
const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

























/*

//////////////////////////////////////////////////////
// TO DELETE THE REST HERE WHEN IT IS MOVED OVER
/////////////////////////////////////////////////////



//fonction de création de folder (quiz)
app.post('/create-folder', async (req, res) => {
  const { userId, longText } = req.body;

  if (!userId || !longText) {
    return res.status(400).json({ message: 'il manque un text ou un id dutilisateur' });
  }
  //Trouver un utilisateur par son ID
  const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!existingUser) {
    return res.status(404).json({ message: 'utilisateur non trouvé' });
  }
  //Ajouter un folder à un utilisateur 
  try {

    await foldersCollection.insertOne({ userId: new ObjectId(userId), longText });
    res.status(201).json({ message: 'Folder créé' });

  } catch (error) {

    console.error('erreur lors de la création du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });

  }
});

//Fonction  pour récupérer un quiz
app.get('/folder/:folderId', async (req, res) => {

  const folderId = req.params.folderId;

  try {
    //Trouver un folder selon son id 
    const folder = await foldersCollection.findOne({ _id: new ObjectId(folderId) });
    if (!folder) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }

    res.status(200).json(folder);

  } catch (error) {

    console.error('erreur lors de la récupération du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });

  }
});

//Fonction pour récupérer les quiz d'un utilisateur
app.get('/folders/:userId', async (req, res) => {

  const userId = req.params.userId;

  try {
    //Trouver les quizz d'un utilisateur  en fonction de son Id
    const userFolders = await foldersCollection.find({ userId: new ObjectId(userId) }).toArray();
    res.status(200).json(userFolders);

  } catch (error) {

    console.error('erreur lors de la récupération du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });

  }
});

//Fonction pour dupliquer un quiz
app.post('/duplicate-folder/:folderId', async (req, res) => {
  const folderId = req.params.folderId;

  try {
    //Trouver le quizz a dupliquer 
    const folderToDuplicate = await foldersCollection.findOne({ _id: new ObjectId(folderId) });
    if (!folderToDuplicate) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    //Suppression du id du quizz pour ne pas le répliquer 
    delete folderToDuplicate._id;
    //Ajout du duplicata
    const newFolder = await foldersCollection.insertOne({ ...folderToDuplicate });
    res.status(201).json({ message: 'Dossier dupliqué avec succès pour un autre utilisateur', newFolderId: newFolder.insertedId });

  } catch (error) {

    console.error('Erreur lors de la duplication du dossier :', error);
    res.status(500).json({ message: 'erreur interne du serveur' });

  }
});

//Dupliquer un quiz pour un autre utilisateur
app.post('/duplicate-folder-to-user/:folderId', async (req, res) => {

  const folderId = req.params.folderId;
  const { newUserId } = req.body;

  try {
    //Trouver le quiz à dupliquer
    const folderToDuplicate = await foldersCollection.findOne({ _id: new ObjectId(folderId) });
    if (!folderToDuplicate) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    //Suppression du id du quizz pour ne pas le répliquer
    delete folderToDuplicate._id;
     //Ajout du duplicata pour l'autre usager
    const newFolder = await foldersCollection.insertOne({ ...folderToDuplicate, userId: new ObjectId(newUserId) });
    res.status(201).json({ message: 'Dossier dupliqué avec succès pour un autre utilisateur', newFolderId: newFolder.insertedId });

  } catch (error) {

    console.error('Erreur lors de la duplication du dossier :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
    
  }
});
*/