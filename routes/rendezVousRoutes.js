const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const auth = require('../middleware/auth');

router.get('/', auth, rendezVousController.getAllRendezVous);
router.get('/:id', auth, rendezVousController.getRendezVousById);
router.post('/', auth, rendezVousController.createRendezVous);
router.put('/:id', auth, rendezVousController.updateRendezVous);
router.delete('/:id', auth, rendezVousController.deleteRendezVous);
router.get('/avocat/:avocatId', auth, rendezVousController.getRendezVousByAvocat);
router.get('/client/:clientId', auth, rendezVousController.getRendezVousByClient);

module.exports = router;