const express = require('express');
const router = express.Router();
const clientAvocatController = require('../controllers/clientAvocatController');
const auth = require('../middleware/auth');

router.get('/', auth, clientAvocatController.getClientsAndAvocats);

module.exports = router;