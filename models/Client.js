const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  CIN: { type: String, required: true, unique: true },
  telephone_1: { type: String, required: true },
  telephone_2: { type: String },
  adresse_1: { type: String, required: true },
  adresse_2: { type: String },
  avocat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Avocat', 
    required: true 
  },
  affaires: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AffaireClient' 
  }],
});

module.exports = mongoose.model('Client', clientSchema);