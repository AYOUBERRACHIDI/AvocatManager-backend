const AffaireClient = require('../models/AffaireClient');

exports.getAllAffaireClients = async (req, res) => {
  try {
    const query = {};
    if (req.query.client_id) query.client_id = req.query.client_id;
    if (req.query.affaire_id) query.affaire_id = req.query.affaire_id;

    const affaireClients = await AffaireClient.find(query)
      .populate('affaire_id')
      .populate('client_id');
    res.status(200).json(affaireClients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaireClients', error });
  }
};

exports.getAffaireClientById = async (req, res) => {
  try {
    const affaireClient = await AffaireClient.findById(req.params.id)
      .populate('affaire_id')
      .populate('client_id');
    if (!affaireClient) return res.status(404).json({ message: 'AffaireClient not found' });
    res.status(200).json(affaireClient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaireClient', error });
  }
};

exports.createAffaireClient = async (req, res) => {
  try {
    const affaireClient = new AffaireClient(req.body);
    await affaireClient.save();
    res.status(201).json(affaireClient);
  } catch (error) {
    res.status(400).json({ message: 'Error creating affaireClient', error });
  }
};

exports.updateAffaireClient = async (req, res) => {
  try {
    const affaireClient = await AffaireClient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('affaire_id').populate('client_id');
    if (!affaireClient) return res.status(404).json({ message: 'AffaireClient not found' });
    res.status(200).json(affaireClient);
  } catch (error) {
    res.status(400).json({ message: 'Error updating affaireClient', error });
  }
};

exports.deleteAffaireClient = async (req, res) => {
  try {
    const affaireClient = await AffaireClient.findByIdAndDelete(req.params.id);
    if (!affaireClient) return res.status(404).json({ message: 'AffaireClient not found' });
    res.status(200).json({ message: 'AffaireClient deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting affaireClient', error });
  }
};