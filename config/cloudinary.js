const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmmtwixbb',
  api_key: process.env.CLOUDINARY_API_KEY || '841275441863675',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cK5Pj8dFjTau-1vLnc5yZ5hAc40',
});

module.exports = cloudinary;