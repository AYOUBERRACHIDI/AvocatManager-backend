const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');
const serverless = require('serverless-http');

const authRoutes = require('./routes/authRoutes');
const avocatRoutes = require('./routes/avocatRoutes');
const clientRoutes = require('./routes/clientRoutes');
const secretaireRoutes = require('./routes/secretaireRoutes');
const errorHandler = require('./middleware/error');
const affaireRoutes = require('./routes/affaireRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const affaireClientRoutes = require('./routes/affaireClientRoutes');
const affaireAdversaireRoutes = require('./routes/affaireAdversaireRoutes');
const typeRoutes = require('./routes/typeRoutes');
const adversaireRoutes = require('./routes/adversaireRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const transactionPaiementRoutes = require('./routes/transactionPaiementRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

// Initialize Express app
const app = express();

// MongoDB connection with reuse and timeout
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    console.log('Reusing existing MongoDB connection');
    return cachedConnection;
  }

  try {
    const startTime = Date.now();
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5-second timeout
      connectTimeoutMS: 5000, // 5-second timeout
    });
    console.log(`MongoDB connected in ${Date.now() - startTime}ms`);
    return cachedConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // Let Vercel log the error
  }
}

// Establish connection at startup (cold start)
connectToDatabase().catch(err => {
  console.error('Failed to connect to MongoDB at startup:', err);
  process.exit(1);
});

// Middleware
app.use(cors({ origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route for debugging
app.get('/health', (req, res) => {
  res.status(200).send('API is working!');
});

// Routes
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

// Comment out static file serving until migrated to Cloudinary/S3
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(errorHandler);

// Export for serverless
module.exports.handler = serverless(app);