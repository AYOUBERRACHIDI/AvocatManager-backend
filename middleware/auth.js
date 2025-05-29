const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Avocat = require('../models/Avocat');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_par_defaut');
    console.log('Decoded JWT payload:', decoded); 

    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token: No ID in payload' });
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token: ID is not a valid ObjectId' });
    }

    const avocat = await Avocat.findById(decoded.id);
    if (!avocat) {
      return res.status(401).json({ message: 'Invalid token: Avocat not found' });
    }

    req.user = decoded.id;
    req.token = token;
    req.avocat = avocat;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = auth;