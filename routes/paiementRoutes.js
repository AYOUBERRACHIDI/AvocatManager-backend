const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const auth = require('../middleware/auth');

router.get('/', auth, paiementController.getAllPaiements);
router.get('/:id', auth, paiementController.getPaiementById);
router.post('/', auth, paiementController.createPaiement);
router.put('/:id', auth, paiementController.updatePaiement);
router.delete('/:id', auth, paiementController.deletePaiement);


module.exports = router;