const express = require('express');
const router = express.Router();
const secretaireController = require('../controllers/secretaireController');
const auth = require('../middleware/auth');

router.get('/', auth, secretaireController.getAllSecretaires);
router.get('/:id', auth, secretaireController.getSecretaireById);
router.post('/', auth, secretaireController.createSecretaire);
router.put('/:id', auth, secretaireController.updateSecretaire);
router.delete('/:id', auth, secretaireController.deleteSecretaire);

module.exports = router;