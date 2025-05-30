const Adversaire = require('../models/Adversaire');

exports.getAllAdversaires = async (req, res) => {
  try {
    const adversaires = await Adversaire.find();
    res.status(200).json(adversaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adversaires', error });
  }
};

exports.getAdversaireById = async (req, res) => {
  try {
    const adversaire = await Adversaire.findById(req.params.id);
    if (!adversaire) return res.status(404).json({ message: 'Adversaire not found' });
    res.status(200).json(adversaire);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adversaire', error });
  }
};

exports.createAdversaire = async (req, res) => {
  try {
    const adversaire = new Adversaire(req.body);
    await adversaire.save();
    res.status(201).json(adversaire);
  } catch (error) {
    res.status(400).json({ message: 'Error creating adversaire', error });
  }
};

exports.updateAdversaire = async (req, res) => {
  try {
    const adversaire = await Adversaire.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!adversaire) return res.status(404).json({ message: 'Adversaire not found' });
    res.status(200).json(adversaire);
  } catch (error) {
    res.status(400).json({ message: 'Error updating adversaire', error });
  }
};

exports.deleteAdversaire = async (req, res) => {
  try {
    const adversaire = await Adversaire.findByIdAndDelete(req.params.id);
    if (!adversaire) return res.status(404).json({ message: 'Adversaire not found' });
    res.status(200).json({ message: 'Adversaire deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting adversaire', error });
  }
};