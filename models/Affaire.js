const mongoose = require('mongoose');

const affaireSchema = new mongoose.Schema({
  case_number: { type: String, required: false },
  client_role: {
    type: String,
    enum: ['plaignant', 'défendeur'],
    required: true,
  },
  statut: {
    type: String,
    enum: ['en cours', 'terminée', 'archived'],
    default: 'en cours',
  },
  category: {
    type: String,
    enum: ['civil', 'criminal', 'commercial', 'administrative', 'family', 'labor'],
    required: true,
  },
  type: { type: String, required: true },
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
  adversaire: { type: String, required: true },
  case_level: {
    type: String,
    enum: ['primary', 'appeal'],
    default: 'primary',
    required: true,
  },
  primary_case_number: {
    type: String,
    required: function () {
      return this.case_level === 'appeal';
    },
  },
  fee_type: {
    type: String,
    enum: ['comprehensive', 'lawyer_only'],
    required: true,
  },
  lawyer_fees: {
    type: Number,
    required: true,
    min: 0,
  },
  case_expenses: {
    type: Number,
    required: function () {
      return this.fee_type === 'comprehensive';
    },
    min: 0,
  },
  attachments: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
  }],
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  archiveRemarks: { type: String },
  date_creation: { type: Date, default: Date.now },
});

affaireSchema.virtual('total_paid_amount').get(async function () {
  const Paiement = mongoose.model('Paiement');
  const payments = await Paiement.find({ affaire_id: this._id });
  return payments.reduce((total, payment) => total + (payment.paid_amount || 0), 0);
});

affaireSchema.set('toJSON', { virtuals: true });
affaireSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Affaire', affaireSchema);