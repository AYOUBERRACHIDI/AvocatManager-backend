const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const auth = require('../middleware/auth');

router.get('/', auth, consultationController.getAllConsultations);
router.get('/:id', auth, consultationController.getConsultationById);
router.post('/', auth, consultationController.createConsultation);
router.put('/:id', auth, consultationController.updateConsultation);
router.delete('/:id', auth, consultationController.deleteConsultation);


module.exports = router;