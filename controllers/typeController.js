const Type = require('../models/Type');
const mongoose = require('mongoose');

exports.getAllTypes = async (req, res) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching types', error });
  }
};

exports.getTypeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Type ID' });
    }
    const type = await Type.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type not found' });
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching type', error });
  }
};

exports.createType = async (req, res) => {
  try {
    const type = new Type(req.body);
    await type.save();
    res.status(201).json(type);
  } catch (error) {
    res.status(400).json({ message: 'Error creating type', error });
  }
};


exports.updateType = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Type ID' });
    }
    const type = await Type.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!type) return res.status(404).json({ message: 'Type not found' });
    res.status(200).json(type);
  } catch (error) {
    res.status(400).json({ message: 'Error updating type', error });
  }
};


exports.deleteType = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Type ID' });
    }
    const type = await Type.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type not found' });
    res.status(200).json({ message: 'Type deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting type', error });
  }
};