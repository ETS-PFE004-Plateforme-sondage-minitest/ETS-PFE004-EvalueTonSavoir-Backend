const express = require("express");
const app = express();
const http = require("http");
const { setupWebsocket } = require("./src/socket/socket");
const cors = require("cors");
const { Server } = require("socket.io");
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
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

const server = http.createServer(app);
const io = configureServer(server);
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
// Connexion à MongoDB
client.connect()
  .then(() => {
    console.log('Connecté à MongoDB');
    // Définition de la collection "users"
    db = client.db('evaluetonsavoir');
    usersCollection = db.collection('users');
    foldersCollection = db.collection('folders');
  })
  .catch(err => console.error('erreur de connexion MongoDB :', err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'infoevaluetonsavoir@gmail.com', // Adresse courriel Gmail utilisée pour l'envoi
    pass: 'vvml wmfr dkzb vjzb' // Mot de passe de votre adresse courriel Gmail
  }
});

setupWebsocket(io);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 4400;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.post('/register', async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'body invalide' });
  }
  const { email, password } = req.body;
  const existingUser = await usersCollection.findOne({ email });
  console.log(req);
  if (existingUser) {
    return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
  }
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ email, password: hashedPassword });
    transporter.sendMail({
      from: 'infoevaluetonsavoir@gmail.com',
      to: email,
      subject: 'Confirmation de compte',
      text: 'Votre compte a été créé avec succès.'
    });
  
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  });
app.post('/login', async (req, res) => {
  console.log(req.body);
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'body invalide' });
  }
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Mot de passe incorrect' });
  }
  res.status(200).json({ message: 'Connexion réussie' });
});
app.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const newPassword = Math.random().toString(36).slice(-8); // Générer un nouveau mot de passe temporaire
  const hashedPassword = await bcrypt.hash(newPassword, 10); // Hasher le nouveau mot de passe
  try {
    // Mettre à jour le mot de passe de l'utilisateur dans la base de données avec le mot de passe hashé
    await usersCollection.updateOne({ email }, { $set: { password: hashedPassword } });
    transporter.sendMail({
      from: 'infoevaluetonsavoir@gmail.com',
      to: email,
      subject: 'Réinitialisation du mot de passe',
      text: `Votre nouveau mot de passe temporaire est : ${newPassword}`
    });

    res.status(200).json({ message: 'Nouveau mot de passe envoyé par courriel' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});
app.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'L\'ancien mot de passe est incorrect' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await usersCollection.updateOne({ email }, { $set: { password: hashedNewPassword } });
    res.status(200).json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});
app.post('/create-folder', async (req, res) => {
  const { userId, longText } = req.body;
  if (!userId || !longText) {
    return res.status(400).json({ message: 'il manque un text ou un id dutilisateur' });
  }
  const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!existingUser) {
    return res.status(404).json({ message: 'utilisateur non trouvé' });
  }
  try {
    await foldersCollection.insertOne({ userId: new ObjectId(userId), longText });
    res.status(201).json({ message: 'Folder créé' });
  } catch (error) {
    console.error('erreur lors de la création du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });
  }
});
app.get('/folder/:folderId', async (req, res) => {
  const folderId = req.params.folderId;
  try {
    const folder = await foldersCollection.findOne({ _id:new ObjectId(folderId) });
    if (!folder) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    res.status(200).json(folder);
  } catch (error) {
    console.error('erreur lors de la récupération du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });
  }
});
app.get('/folders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userFolders = await foldersCollection.find({ userId:new ObjectId(userId) }).toArray();
    res.status(200).json(userFolders);
  } catch (error) {
    console.error('erreur lors de la récupération du folders:', error);
    res.status(500).json({ message: 'erreur interne du serveur' });
  }
});
app.post('/duplicate-folder/:folderId', async (req, res) => {
  const folderId = req.params.folderId;

  try {
    const folderToDuplicate = await foldersCollection.findOne({ _id:new ObjectId(folderId) });
    console.log(folderToDuplicate);
    if (!folderToDuplicate) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    delete folderToDuplicate._id;
    const newFolder = await foldersCollection.insertOne({ ...folderToDuplicate });
    res.status(201).json({ message: 'Dossier dupliqué avec succès pour un autre utilisateur', newFolderId: newFolder.insertedId });
  } catch (error) {
    console.error('Erreur lors de la duplication du dossier :', error);
    res.status(500).json({ message: 'erreur interne du serveur' });
  }
});
app.post('/duplicate-folder-to-user/:folderId', async (req, res) => {
  const folderId = req.params.folderId;
  const { newUserId } = req.body;
  try {
    const folderToDuplicate = await foldersCollection.findOne({ _id:new ObjectId(folderId) });
    if (!folderToDuplicate) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    delete folderToDuplicate._id;
    const newFolder = await foldersCollection.insertOne({ ...folderToDuplicate, userId:new ObjectId(newUserId) });
    res.status(201).json({ message: 'Dossier dupliqué avec succès pour un autre utilisateur', newFolderId: newFolder.insertedId });
  } catch (error) {
    console.error('Erreur lors de la duplication du dossier :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});
