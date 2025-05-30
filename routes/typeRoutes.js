const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const auth = require('../middleware/auth');

router.get('/', auth, typeController.getAllTypes);
router.get('/main', auth, async (req, res) => {
  try {
    const types = await require('../models/Type').find({ mainType: null });
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الأنواع الرئيسية', error: error.message });
  }
});
router.get('/:id', auth, typeController.getTypeById);
router.post('/', auth, typeController.createType);
router.put('/:id', auth, typeController.updateType);
router.delete('/:id', auth, typeController.deleteType);


module.exports = router;