const mongoose = require('mongoose');
const Paiement = require('../models/Paiement');
const Client = require('../models/Client');

exports.getAllPaiements = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const paiements = await Paiement.find({ avocat_id: lawyerId })
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .populate('consultation_id', 'date_debut heure_debut')
      .lean();

    const sanitizedPaiements = paiements.map(p => ({
      ...p,
      client_id: p.client_id || { _id: p.client_id, nom: 'غير متوفر' },
      affaire_id: p.affaire_id || null,
      consultation_id: p.consultation_id || null,
    }));
    res.status(200).json(sanitizedPaiements);
  } catch (error) {
    console.error('Error fetching paiements:', error);
    res.status(500).json({ message: 'خطأ في جلب الدفعات', error: error.message });
  }
};

exports.getPaiementById = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const paiement = await Paiement.findOne({ _id: req.params.id, avocat_id: lawyerId })
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .populate('consultation_id', 'date_debut heure_debut')
      .lean();
    if (!paiement) {
      return res.status(404).json({ message: 'الدفعة غير موجودة أو غير مصرح لك' });
    }
    const sanitizedPaiement = {
      ...paiement,
      client_id: paiement.client_id || { _id: paiement.client_id, nom: 'غير متوفر' },
      affaire_id: paiement.affaire_id || null,
      consultation_id: paiement.consultation_id || null,
    };
    res.status(200).json(sanitizedPaiement);
  } catch (error) {
    console.error('Error fetching paiement:', error);
    res.status(500).json({ message: 'خطأ في جلب الدفعة', error: error.message });
  }
};

exports.createPaiement = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const { client_id, mode_paiement, paid_amount, affaire_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(client_id)) {
      return res.status(400).json({ message: 'معرف العميل غير صالح' });
    }
    const client = await Client.findOne({ _id: client_id, avocat_id: lawyerId });
    if (!client) {
      return res.status(400).json({ message: 'العميل غير موجود أو غير مصرح لك' });
    }

    if (!['cheque', 'espece'].includes(mode_paiement)) {
      return res.status(400).json({ message: 'طريقة الدفع غير صالحة، يجب أن تكون "cheque" أو "espece"' });
    }

    if (paid_amount < 0) {
      return res.status(400).json({ message: 'المبلغ المدفوع يجب أن يكون أكبر من أو يساوي 0' });
    }

    const paiement = new Paiement({
      ...req.body,
      avocat_id: lawyerId,
      montant_total: paid_amount, 
    });
    await paiement.save();

    const populatedPaiement = await Paiement.findById(paiement._id)
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .populate('consultation_id', 'date_debut heure_debut')
      .lean();
    const sanitizedPaiement = {
      ...populatedPaiement,
      client_id: populatedPaiement.client_id || { _id: client_id, nom: 'غير متوفر' },
      affaire_id: populatedPaiement.affaire_id || null,
      consultation_id: populatedPaiement.consultation_id || null,
    };
    res.status(201).json(sanitizedPaiement);
  } catch (error) {
    console.error('Error creating paiement:', error);
    res.status(400).json({ message: 'خطأ في إنشاء الدفعة', error: error.message });
  }
};

exports.updatePaiement = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const { client_id, mode_paiement, paid_amount, affaire_id } = req.body;

    if (client_id) {
      if (!mongoose.Types.ObjectId.isValid(client_id)) {
        return res.status(400).json({ message: 'معرف العميل غير صالح' });
      }
      const client = await Client.findOne({ _id: client_id, avocat_id: lawyerId });
      if (!client) {
        return res.status(400).json({ message: 'العميل غير موجود أو غير مصرح لك' });
      }
    }

    if (mode_paiement && !['cheque', 'espece'].includes(mode_paiement)) {
      return res.status(400).json({ message: 'طريقة الدفع غير صالحة، يجب أن تكون "cheque" أو "espece"' });
    }

    if (paid_amount && paid_amount < 0) {
      return res.status(400).json({ message: 'المبلغ المدفوع يجب أن يكون أكبر من أو يساوي 0' });
    }

    const updateData = {
      ...req.body,
      montant_total: paid_amount || undefined, 
    };

    const paiement = await Paiement.findOneAndUpdate(
      { _id: req.params.id, avocat_id: lawyerId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .populate('consultation_id', 'date_debut heure_debut')
      .lean();
    if (!paiement) {
      return res.status(404).json({ message: 'الدفعة غير موجودة أو غير مصرح لك' });
    }

    const sanitizedPaiement = {
      ...paiement,
      client_id: paiement.client_id || { _id: client_id || paiement.client_id, nom: 'غير متوفر' },
      affaire_id: paiement.affaire_id || null,
      consultation_id: paiement.consultation_id || null,
    };
    res.status(200).json(sanitizedPaiement);
  } catch (error) {
    console.error('Error updating paiement:', error);
    res.status(400).json({ message: 'خطأ في تحديث الدفعة', error: error.message });
  }
};

exports.deletePaiement = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const paiement = await Paiement.findOneAndDelete({
      _id: req.params.id,
      avocat_id: lawyerId,
    });
    if (!paiement) {
      return res.status(404).json({ message: 'الدفعة غير موجودة أو غير مصرح لك' });
    }
    res.status(200).json({ message: 'تم حذف الدفعة بنجاح' });
  } catch (error) {
    console.error('Error deleting paiement:', error);
    res.status(500).json({ message: 'خطأ في حذف الدفعة', error: error.message });
  }
};