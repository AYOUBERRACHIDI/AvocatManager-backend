const mongoose = require('mongoose');

const transactionPaiementSchema = new mongoose.Schema({
  date_transaction: { type: Date, default: Date.now },
  montant: { type: Number, required: true },
  mode_paiement: { type: String, enum: ['espèces', 'chèque', 'virement'], required: true },
  type_transaction: { type: String, enum: ['paiement', 'avance'], required: true },
  reçu_pdf: { type: String },
  paiement_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paiement', required: true },
});

module.exports = mongoose.model('TransactionPaiement', transactionPaiementSchema);