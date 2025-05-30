const mongoose = require('mongoose');

const affaireAdversaireSchema = new mongoose.Schema({
  affaire_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Affaire', required: true },
  adversaire_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Adversaire', required: true },
});

module.exports = mongoose.model('AffaireAdversaire', affaireAdversaireSchema);