const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const Client = require('../models/Client');  

exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ avocat_id: req.avocat._id })
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean(); 

    const formattedConsultations = consultations.map((c) => ({
      _id: c._id,
      date_debut: c.date, 
      heure_debut: c.heure_debut,
      heure_fin: c.heure_fin,
      client_id: c.client_id || null,
      affaire_id: c.affaire_id || null,
      status: c.status,
      montant: c.montant || null,
      mode_paiement: c.mode_paiement || null,
      notes: typeof c.notes === 'string' && c.notes.includes('notes:') ? tryParseNotes(c.notes)?.notes || c.notes : c.notes || '',
    }));

    res.status(200).json(formattedConsultations);
  } catch (error) {
    console.error('Error in getAllConsultations:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
};

exports.getConsultationById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      avocat_id: req.avocat._id,
    })
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean();

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found or not authorized' });
    }

    const formattedConsultation = {
      _id: consultation._id,
      date_debut: consultation.date,
      heure_debut: consultation.heure_debut,
      heure_fin: consultation.heure_fin,
      client_id: consultation.client_id || null,
      affaire_id: consultation.affaire_id || null,
      status: consultation.status,
      montant: consultation.montant || null,
      mode_paiement: consultation.mode_paiement || null,
      notes: typeof consultation.notes === 'string' && consultation.notes.includes('notes:') ? tryParseNotes(consultation.notes)?.notes || consultation.notes : consultation.notes || '',
    };

    res.status(200).json(formattedConsultation);
  } catch (error) {
    console.error('Error in getConsultationById:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching consultation', error: error.message });
  }
};

exports.createConsultation = async (req, res) => {
  try {
    const { date, heure_debut, heure_fin, status, client_id, affaire_id, notes, montant, mode_paiement } = req.body;

    if (!date || !heure_debut || !heure_fin || !client_id) {
      return res.status(400).json({ message: 'Missing required fields: date, heure_debut, heure_fin, client_id' });
    }
    if (!mongoose.Types.ObjectId.isValid(client_id)) {
      return res.status(400).json({ message: 'Invalid client_id' });
    }
    if (affaire_id && !mongoose.Types.ObjectId.isValid(affaire_id)) {
      return res.status(400).json({ message: 'Invalid affaire_id' });
    }

    const conflicts = await Consultation.find({
      avocat_id: req.avocat._id,
      date: new Date(date),
      $or: [
        { heure_debut: { $lt: heure_fin }, heure_fin: { $gt: heure_debut } },
      ],
    }).populate('client_id', 'nom prenom');

    if (conflicts.length > 0) {
      const formattedConflicts = conflicts.map((c) => ({
        _id: c._id,
        client: c.client_id?.nom || 'Unknown Client',
        date_debut: c.date,
        heure_debut: c.heure_debut,
        heure_fin: c.heure_fin,
      }));
      return res.status(400).json({ message: 'Conflict with existing consultation', conflicts: formattedConflicts });
    }

    const notesData = typeof notes === 'object' ? JSON.stringify(notes) : notes || '';

    const consultation = new Consultation({
      date,
      heure_debut,
      heure_fin,
      status: status || 'pending',
      avocat_id: req.avocat._id,
      client_id,
      affaire_id: affaire_id || null,
      notes: notesData,
      montant: montant || null,
      mode_paiement: mode_paiement || null,
    });

    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean();

    const formattedConsultation = {
      _id: populatedConsultation._id,
      date_debut: populatedConsultation.date,
      heure_debut: populatedConsultation.heure_debut,
      heure_fin: populatedConsultation.heure_fin,
      client_id: populatedConsultation.client_id || null,
      affaire_id: populatedConsultation.affaire_id || null,
      status: populatedConsultation.status,
      montant: populatedConsultation.montant || null,
      mode_paiement: populatedConsultation.mode_paiement || null,
      notes: typeof populatedConsultation.notes === 'string' && populatedConsultation.notes.includes('notes:') ? tryParseNotes(populatedConsultation.notes)?.notes || populatedConsultation.notes : populatedConsultation.notes || '',
    };

    res.status(201).json(formattedConsultation);
  } catch (error) {
    console.error('Error in createConsultation:', error.message, error.stack);
    res.status(400).json({ message: 'Error creating consultation', error: error.message });
  }
};

exports.updateConsultation = async (req, res) => {
  try {
    const { date, heure_debut, heure_fin, status, client_id, affaire_id, notes, montant, mode_paiement } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }
    if (client_id && !mongoose.Types.ObjectId.isValid(client_id)) {
      return res.status(400).json({ message: 'Invalid client_id' });
    }
    if (affaire_id && !mongoose.Types.ObjectId.isValid(affaire_id)) {
      return res.status(400).json({ message: 'Invalid affaire_id' });
    }

    const notesData = typeof notes === 'object' ? JSON.stringify(notes) : notes || '';

    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, avocat_id: req.avocat._id },
      {
        date,
        heure_debut,
        heure_fin,
        status,
        client_id,
        affaire_id: affaire_id || null,
        notes: notesData,
        montant: montant || null,
        mode_paiement: mode_paiement || null,
      },
      { new: true, runValidators: true }
    )
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean();

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found or not authorized' });
    }

    const formattedConsultation = {
      _id: consultation._id,
      date_debut: consultation.date,
      heure_debut: consultation.heure_debut,
      heure_fin: consultation.heure_fin,
      client_id: consultation.client_id || null,
      affaire_id: consultation.affaire_id || null,
      status: consultation.status,
      montant: consultation.montant || null,
      mode_paiement: consultation.mode_paiement || null,
      notes: typeof consultation.notes === 'string' && consultation.notes.includes('notes:') ? tryParseNotes(consultation.notes)?.notes || consultation.notes : consultation.notes || '',
    };

    res.status(200).json(formattedConsultation);
  } catch (error) {
    console.error('Error in updateConsultation:', error.message, error.stack);
    res.status(400).json({ message: 'Error updating consultation', error: error.message });
  }
};

exports.deleteConsultation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid consultation ID' });
    }

    const consultation = await Consultation.findOneAndDelete({
      _id: req.params.id,
      avocat_id: req.avocat._id,
    });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found or not authorized' });
    }

    res.status(200).json({ message: 'Consultation deleted' });
  } catch (error) {
    console.error('Error in deleteConsultation:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting consultation', error: error.message });
  }
};

exports.getConsultationsByAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.avocatId)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }

    const consultations = await Consultation.find({ avocat_id: req.params.avocatId })
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean();

    const formattedConsultations = consultations.map((c) => ({
      _id: c._id,
      date_debut: c.date,
      heure_debut: c.heure_debut,
      heure_fin: c.heure_fin,
      client_id: c.client_id || null,
      affaire_id: c.affaire_id || null,
      status: c.status,
      montant: c.montant || null,
      mode_paiement: c.mode_paiement || null,
      notes: typeof c.notes === 'string' && c.notes.includes('notes:') ? tryParseNotes(c.notes)?.notes || c.notes : c.notes || '',
    }));

    res.status(200).json(formattedConsultations);
  } catch (error) {
    console.error('Error in getConsultationsByAvocat:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
};

exports.getConsultationsByClient = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const consultations = await Consultation.find({ client_id: req.params.clientId })
      .populate('client_id', 'nom prenom')
      .populate('affaire_id', 'titre')
      .lean();

    const formattedConsultations = consultations.map((c) => ({
      _id: c._id,
      date_debut: c.date,
      heure_debut: c.heure_debut,
      heure_fin: c.heure_fin,
      client_id: c.client_id || null,
      affaire_id: c.affaire_id || null,
      status: c.status,
      montant: c.montant || null,
      mode_paiement: c.mode_paiement || null,
      notes: typeof c.notes === 'string' && c.notes.includes('notes:') ? tryParseNotes(c.notes)?.notes || c.notes : c.notes || '',
    }));

    res.status(200).json(formattedConsultations);
  } catch (error) {
    console.error('Error in getConsultationsByClient:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching consultations', error: error.message });
  }
};

function tryParseNotes(notes) {
  try {
    return JSON.parse(notes);
  } catch (e) {
    console.warn('Failed to parse notes:', notes, e.message);
    return null;
  }
}