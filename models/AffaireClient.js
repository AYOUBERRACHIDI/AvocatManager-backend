const mongoose = require('mongoose');

const affaireClientSchema = new mongoose.Schema({
  affaire_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Affaire', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
});

module.exports = mongoose.model('AffaireClient', affaireClientSchema);