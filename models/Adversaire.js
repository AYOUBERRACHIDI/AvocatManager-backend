const mongoose = require('mongoose');

const adversaireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  CIN: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  adresse: { type: String, required: true },
});

module.exports = mongoose.model('Adversaire', adversaireSchema);