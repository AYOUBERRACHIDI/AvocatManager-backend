const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const avocatSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telephone: { type: String, required: true },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  logo: { type: String },
  logo_public_id: { type: String }, 
  specialiteJuridique: { type: String },
  nomCabinet: { type: String },
});

avocatSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

avocatSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Avocat', avocatSchema);