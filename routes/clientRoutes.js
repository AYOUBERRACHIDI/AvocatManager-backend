const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

router.get('/', auth, clientController.getAllClients);
router.get('/:id', auth, clientController.getClientById);
router.post('/', auth, clientController.createClient);
router.put('/:id', auth, clientController.updateClient);
router.delete('/:id', auth, clientController.deleteClient);
router.get('/search', auth, clientController.searchClients); 

module.exports = router;