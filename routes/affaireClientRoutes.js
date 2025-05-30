const express = require('express');
const router = express.Router();
const affaireClientController = require('../controllers/affaireClientController');
const auth = require('../middleware/auth');

router.get('/', auth, affaireClientController.getAllAffaireClients);
router.get('/:id', auth, affaireClientController.getAffaireClientById);
router.post('/', auth, affaireClientController.createAffaireClient);
router.put('/:id', auth, affaireClientController.updateAffaireClient);
router.delete('/:id', auth, affaireClientController.deleteAffaireClient);

module.exports = router;