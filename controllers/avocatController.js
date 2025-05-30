const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Avocat = require('../models/Avocat');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (file) => {
  try {
    const fileBuffer = file.buffer.toString('base64');
    const fileType = file.mimetype.split('/')[1];
    const dataUri = `data:${file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'affaires',
      resource_type: 'image',
      upload_preset: 'affaires', 
      access_mode: 'public',
    });

    if (!result.secure_url.startsWith('https://res.cloudinary.com')) {
      throw new Error('Invalid Cloudinary URL');
    }

    console.log('Uploaded logo:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

exports.getAllAvocats = async (req, res) => {
  try {
    const avocats = await Avocat.find().select('-password');
    res.status(200).json(avocats);
  } catch (error) {
    console.error('Error fetching all avocats:', error);
    res.status(500).json({ message: 'Error fetching avocats', error: error.message });
  }
};

exports.getAvocatById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }
    const avocat = await Avocat.findById(req.params.id).select('-password');
    if (!avocat) return res.status(404).json({ message: 'Avocat not found' });
    res.status(200).json(avocat);
  } catch (error) {
    console.error('Error fetching avocat by ID:', error);
    res.status(500).json({ message: 'Error fetching avocat', error: error.message });
  }
};

exports.getCurrentAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const avocat = await Avocat.findById(req.user).select('-password');
    if (!avocat) {
      return res.status(404).json({ error: 'Avocat not found' });
    }

    res.status(200).json(avocat);
  } catch (error) {
    console.error('Error in getCurrentAvocat:', error);
    res.status(500).json({ error: 'Error fetching current avocat', details: error.message });
  }
};

exports.createAvocat = async (req, res) => {
  try {
    let logoData = {};
    if (req.file) {
      logoData = await uploadToCloudinary(req.file);
    }

    const avocatData = {
      ...req.body,
      logo: logoData.secure_url || undefined,
      logo_public_id: logoData.public_id || undefined,
    };

    const avocat = new Avocat(avocatData);
    await avocat.save();
    res.status(201).json({ ...avocat.toObject(), password: undefined });
  } catch (error) {
    console.error('Error creating avocat:', error);
    res.status(400).json({ message: 'Error creating avocat', error: error.message });
  }
};

exports.updateAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }

    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat not found' });

    let logoData = {};
    if (req.file) {
      if (avocat.logo_public_id) {
        await cloudinary.uploader.destroy(avocat.logo_public_id, { resource_type: 'image' });
      }
      logoData = await uploadToCloudinary(req.file);
    }

    const updateData = {
      ...req.body,
      logo: logoData.secure_url || avocat.logo,
      logo_public_id: logoData.public_id || avocat.logo_public_id,
    };

    const updatedAvocat = await Avocat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedAvocat);
  } catch (error) {
    console.error('Error updating avocat:', error);
    res.status(400).json({ message: 'Error updating avocat', error: error.message });
  }
};

exports.deleteAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }

    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat not found' });

    if (avocat.logo_public_id) {
      await cloudinary.uploader.destroy(avocat.logo_public_id, { resource_type: 'image' });
    }

    await Avocat.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Avocat deleted' });
  } catch (error) {
    console.error('Error deleting avocat:', error);
    res.status(500).json({ message: 'Error deleting avocat', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const avocat = await Avocat.findById(req.user);
    if (!avocat) {
      return res.status(404).json({ message: 'Avocat not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, avocat.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    avocat.password = hashedPassword;
    await avocat.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};