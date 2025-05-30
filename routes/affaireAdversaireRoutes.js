const express = require('express');
const router = express.Router();
const affaireAdversaireController = require('../controllers/affaireAdversaireController');
const auth = require('../middleware/auth');

router.get('/', auth, affaireAdversaireController.getAllAffaireAdversaires);
router.get('/:id', auth, affaireAdversaireController.getAffaireAdversaireById);
router.post('/', auth, affaireAdversaireController.createAffaireAdversaire);
router.put('/:id', auth, affaireAdversaireController.updateAffaireAdversaire);
router.delete('/:id', auth, affaireAdversaireController.deleteAffaireAdversaire);

module.exports = router;