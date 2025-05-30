const Client = require('../models/Client');
const Avocat = require('../models/Avocat');

exports.getClientsAndAvocats = async (req, res) => {
  try {
    const clients = await Client.find().select('nom prenom');
    const avocats = await Avocat.find().select('nom prenom');
    res.status(200).json({ clients, avocats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients and avocats', error });
  }
};