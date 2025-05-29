const express = require('express');
const router = express.Router();
const avocatController = require('../controllers/avocatController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

router.get('/', auth, avocatController.getAllAvocats);
router.get('/me', auth, avocatController.getCurrentAvocat);
router.put('/me/password', auth, avocatController.updatePassword);
router.get('/:id', auth, avocatController.getAvocatById);
router.post('/', auth, upload.single('logo'), avocatController.createAvocat);
router.put('/:id', auth, upload.single('logo'), avocatController.updateAvocat);
router.delete('/:id', auth, avocatController.deleteAvocat);

module.exports = router;