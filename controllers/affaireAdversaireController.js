const AffaireAdversaire = require('../models/AffaireAdversaire');

exports.getAllAffaireAdversaires = async (req, res) => {
  try {
    const affaireAdversaires = await AffaireAdversaire.find().populate('affaire_id').populate('adversaire_id');
    res.status(200).json(affaireAdversaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaireAdversaires', error });
  }
};

exports.getAffaireAdversaireById = async (req, res) => {
  try {
    const affaireAdversaire = await AffaireAdversaire.findById(req.params.id).populate('affaire_id').populate('adversaire_id');
    if (!affaireAdversaire) return res.status(404).json({ message: 'AffaireAdversaire not found' });
    res.status(200).json(affaireAdversaire);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaireAdversaire', error });
  }
};

exports.createAffaireAdversaire = async (req, res) => {
  try {
    const affaireAdversaire = new AffaireAdversaire(req.body);
    await affaireAdversaire.save();
    res.status(201).json(affaireAdversaire);
  } catch (error) {
    res.status(400).json({ message: 'Error creating affaireAdversaire', error });
  }
};

exports.updateAffaireAdversaire = async (req, res) => {
  try {
    const affaireAdversaire = await AffaireAdversaire.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('affaire_id').populate('adversaire_id');
    if (!affaireAdversaire) return res.status(404).json({ message: 'AffaireAdversaire not found' });
    res.status(200).json(affaireAdversaire);
  } catch (error) {
    res.status(400).json({ message: 'Error updating affaireAdversaire', error });
  }
};

exports.deleteAffaireAdversaire = async (req, res) => {
  try {
    const affaireAdversaire = await AffaireAdversaire.findByIdAndDelete(req.params.id);
    if (!affaireAdversaire) return res.status(404).json({ message: 'AffaireAdversaire not found' });
    res.status(200).json({ message: 'AffaireAdversaire deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting affaireAdversaire', error });
  }
};