const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter,
});

router.get('/dashboard', adminMiddleware, (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur le tableau de bord administrateur' });
});

router.get('/stats', adminMiddleware, adminController.getAdminStats);

router.get('/avocats', adminMiddleware, adminController.getAvocats);
router.get('/avocats/:id', adminMiddleware, adminController.getAvocatById);
router.post('/avocats', adminMiddleware, upload.single('logo'), adminController.createAvocat);
router.put('/avocats/:id', adminMiddleware, upload.single('logo'), adminController.updateAvocat);
router.delete('/avocats/:id', adminMiddleware, adminController.deleteAvocat);

router.get('/secretaires', adminMiddleware, adminController.getSecretaires);
router.get('/secretaires/:id', adminMiddleware, adminController.getSecretaireById);
router.post('/secretaires', adminMiddleware, adminController.createSecretaire);
router.put('/secretaires/:id', adminMiddleware, adminController.updateSecretaire);
router.delete('/secretaires/:id', adminMiddleware, adminController.deleteSecretaire);

router.get('/me', adminMiddleware, adminController.getAdmin);
router.put('/me', adminMiddleware, adminController.updateAdmin);

router.get('/avocats-by-city', adminMiddleware, adminController.getAvocatsByCity);
router.get('/secretaires-by-avocat', adminMiddleware, adminController.getSecretairesByAvocat);

router.post('/messages', adminController.createMessage);
router.get('/messages', adminMiddleware, adminController.getMessages);
router.post('/messages/:id/reply', adminMiddleware, adminController.replyMessage);
router.delete('/messages/:id', adminMiddleware, adminController.deleteMessage);

router.get('/activity-logs', adminMiddleware, adminController.getActivityLogs);

module.exports = router;