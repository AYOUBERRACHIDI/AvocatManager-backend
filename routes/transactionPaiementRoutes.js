const express = require('express');
const router = express.Router();
const transactionPaiementController = require('../controllers/transactionPaiementController');
const auth = require('../middleware/auth');

router.get('/', auth, transactionPaiementController.getAllTransactionsPaiement);
router.get('/:id', auth, transactionPaiementController.getTransactionPaiementById);
router.post('/', auth, transactionPaiementController.createTransactionPaiement);
router.put('/:id', auth, transactionPaiementController.updateTransactionPaiement);
router.delete('/:id', auth, transactionPaiementController.deleteTransactionPaiement);

module.exports = router;