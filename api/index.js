const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ici, importe et utilise tes routes exactement comme dans ton server.js
const authRoutes = require('../routes/authRoutes');
const avocatRoutes = require('../routes/avocatRoutes');
const clientRoutes = require('../routes/clientRoutes');
const secretaireRoutes = require('../routes/secretaireRoutes');
const errorHandler = require('../middleware/error');
const affaireRoutes = require('../routes/affaireRoutes');
const sessionRoutes = require('../routes/sessionRoutes');
const affaireClientRoutes = require('../routes/affaireClientRoutes');
const affaireAdversaireRoutes = require('../routes/affaireAdversaireRoutes');
const typeRoutes = require('../routes/typeRoutes');
const adversaireRoutes = require('../routes/adversaireRoutes');
const consultationRoutes = require('../routes/consultationRoutes');
const rendezVousRoutes = require('../routes/rendezVousRoutes');
const paiementRoutes = require('../routes/paiementRoutes');
const transactionPaiementRoutes = require('../routes/transactionPaiementRoutes');
const adminRoutes = require('../routes/adminRoutes');

app.use('/api/avocats', avocatRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/secretaires', secretaireRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/adversaires', adversaireRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/transactions-paiement', transactionPaiementRoutes);
app.use('/api/affaires', affaireRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/affaire-clients', affaireClientRoutes);
app.use('/api/affaire-adversaires', affaireAdversaireRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.use(errorHandler);

// Connexion MongoDB (important : la connexion doit être gérée ici aussi)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

// Ne PAS utiliser app.listen dans serverless !
// Exporte l’app pour serverless
module.exports.handler = serverless(app);
