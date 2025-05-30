const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  heure_debut: { type: String, required: true },
  heure_fin: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'pending', 'cancelled'], 
    default: 'pending' 
  },
  avocat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Avocat', 
    required: true 
  },
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  affaire_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affaire' 
  },
  notes: { type: String },
  montant: { type: Number },
  mode_paiement: {
    type: String,
    enum: ['espèce', 'chèque', 'virement', 'carte']
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);