const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
  description: { type: String, required: true },
  aff: { type: String, default: null },
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
  affaire_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affaire',
    default: null,
  },
  notes: { type: String, default: '' },
  recurrence: {
    frequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    endDate: { type: Date, default: null },
  },
});

module.exports = mongoose.model('RendezVous', rendezVousSchema);