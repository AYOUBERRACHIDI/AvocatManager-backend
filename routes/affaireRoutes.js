const express = require('express');
const router = express.Router();
const affaireController = require('../controllers/affaireController');
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
}).array('attachments', 5);

router.get('/', auth, affaireController.getAllAffaires);
router.get('/stats', auth, affaireController.getStats);
router.get('/types', auth, affaireController.getCaseTypes);
router.get('/:id', auth, affaireController.getAffaireById);
router.get('/category/:category', auth, affaireController.getAffairesByCategory);
router.post('/', auth, upload, affaireController.createAffaire);
router.put('/:id', auth, upload, affaireController.updateAffaire);
router.put('/:id/attachments', auth, upload, affaireController.addAttachments);
router.delete('/:id/attachments/:filePath', auth, affaireController.deleteAttachment);
router.put('/:id/archive', auth, affaireController.archiveAffaire);
router.put('/restore/:id', auth, affaireController.restoreAffaire);
router.delete('/:id', auth, affaireController.deleteAffaire);
router.get('/client/:clientId', auth, affaireController.getAffairesByClientId);
router.get('/avocat/:avocatId', auth, affaireController.getAffairesByAvocatId);
router.get('/archives/avocat/:avocatId', auth, affaireController.getArchivedAffaires);
router.get('/download/:filePath', auth, affaireController.downloadAttachment);
router.get('/preview/:filePath', auth, affaireController.previewAttachment);

module.exports = router;