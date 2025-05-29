const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

router.get('/day', auth, sessionController.getSessionsByDay);
router.get('/day/pdf', auth, sessionController.generateSessionsByDayPDF);
router.get('/', auth, sessionController.getAllSessions);
router.get('/:id', auth, sessionController.getSessionById);
router.post('/', auth, sessionController.createSession);
router.put('/:id', auth, sessionController.updateSession);
router.delete('/:id', auth, sessionController.deleteSession);
router.get('/avocat/:avocatId', auth, sessionController.getSessionsByAvocat);
router.get('/client/:clientId', auth, sessionController.getSessionsByClient);
router.get('/:id/pdf', auth, sessionController.generateSessionPDF);

module.exports = router;