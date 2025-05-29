const mongoose = require('mongoose');

const secretaireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  telephone: { type: String, required: true },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  avocat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Avocat', required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Secretaire', secretaireSchema);