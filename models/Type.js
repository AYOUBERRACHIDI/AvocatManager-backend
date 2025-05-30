const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Main type (e.g., Commercial, Civil, Pénal)
  sub_types: [{ name: String }], // Array of sub-types
});

module.exports = mongoose.model('Type', typeSchema);