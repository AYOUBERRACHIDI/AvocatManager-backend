const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  emplacement: { type: String, required: true },
  date: { type: Date, required: true },
  heure_debut: { type: String, required: true },
  heure_fin: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  avocat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avocat',
    required: true,
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  rendez_vous_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RendezVous',
    default: null,
  },
  affaire_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affaire',
    default: null,
  },
  case_number: { type: String, default: '' },
  remarque: { type: String, default: '' },
  ordre: { type: Number, required: true },
  gouvernance: { type: String, default: '' },
});

module.exports = mongoose.model('Session', sessionSchema);