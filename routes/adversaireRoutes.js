const express = require('express');
const router = express.Router();
const adversaireController = require('../controllers/adversaireController');
const auth = require('../middleware/auth');

router.get('/', auth, adversaireController.getAllAdversaires);
router.get('/:id', auth, adversaireController.getAdversaireById);
router.post('/', auth, adversaireController.createAdversaire);
router.put('/:id', auth, adversaireController.updateAdversaire);
router.delete('/:id', auth, adversaireController.deleteAdversaire);

module.exports = router;