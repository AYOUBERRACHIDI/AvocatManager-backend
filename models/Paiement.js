const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  montant_total: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  paid_amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  mode_paiement: { 
    type: String, 
    enum: ['cheque', 'espece'], 
    required: true 
  },
  date_creation: { 
    type: Date, 
    default: Date.now 
  },
  statut: { 
    type: String, 
    enum: ['en attente', 'payé', 'annulé'], 
    default: 'en attente' 
  },
  description: { 
    type: String 
  },
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  avocat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Avocat', 
    required: true 
  },
  affaire_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affaire' 
  },
  consultation_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consultation' 
  }
});

module.exports = mongoose.model('Paiement', paiementSchema);