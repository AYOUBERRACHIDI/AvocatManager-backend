const mongoose = require('mongoose');
const RendezVous = require('../models/RendezVous');
const Client = require('../models/Client');
const Session = require('../models/Session');
const Affaire = require('../models/Affaire');

const eventTypes = {
  consultation: { label: 'استشارة', color: '#4caf50' },
  meeting: { label: 'اجتماع مع الموكل بخصوص ملف', color: '#0288d1' },
};

const formatRendezVous = (rendezVous, type) => {
  const isDeadline = rendezVous.description.includes('موعد نهائي');
  return {
    id: rendezVous._id,
    title: `${rendezVous.client_id?.nom || 'Unknown Client'} - ${eventTypes[type].label}${rendezVous.aff ? ` ( الملف: ${rendezVous.aff})` : ''}`,
    start: new Date(`${rendezVous.date.toISOString().split('T')[0]}T${rendezVous.heure_debut}`),
    end: new Date(`${rendezVous.date.toISOString().split('T')[0]}T${rendezVous.heure_fin}`),
    client: rendezVous.client_id?.nom || 'Unknown Client',
    client_id: rendezVous.client_id?._id || null,
    type: type,
    aff: rendezVous.aff || null,
    location: rendezVous.notes?.includes('location:') ? tryParseNotes(rendezVous.notes)?.location : rendezVous.notes || 'غير محدد',
    status: rendezVous.status,
    notes: rendezVous.notes?.includes('notes:') ? tryParseNotes(rendezVous.notes)?.notes : rendezVous.notes || '',
    color: isDeadline ? '#7b1fa2' : eventTypes[type].color,
    recurrence: rendezVous.recurrence?.frequency !== 'none' ? {
      frequency: rendezVous.recurrence.frequency,
      endDate: rendezVous.recurrence.endDate ? rendezVous.recurrence.endDate.toISOString().split('T')[0] : null,
    } : null,
    affaire_id: rendezVous.affaire_id || null,
  };
};

function tryParseNotes(notes) {
  try {
    return JSON.parse(notes);
  } catch (e) {
    console.warn('Failed to parse notes:', notes, e.message);
    return null;
  }
}

exports.getAllRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.find({ avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedRendezVous = rendezVous.map(r => {
      const type = r.aff ? 'meeting' : 'consultation';
      return formatRendezVous(r, type);
    });

    res.status(200).json(formattedRendezVous);
  } catch (error) {
    console.error('Error fetching rendezVous:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching rendezVous', error: error.message });
  }
};

exports.getRendezVousById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid rendezVous ID' });
    }

    const rendezVous = await RendezVous.findOne({ _id: req.params.id, avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!rendezVous) {
      return res.status(404).json({ message: 'RendezVous not found or not authorized' });
    }

    const type = rendezVous.aff ? 'meeting' : 'consultation';
    const formattedRendezVous = formatRendezVous(rendezVous, type);
    res.status(200).json(formattedRendezVous);
  } catch (error) {
    console.error('Error fetching rendezVous:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching rendezVous', error: error.message });
  }
};

exports.createRendezVous = async (req, res) => {
  try {
    const {
      client,
      type,
      aff,
      date,
      startTime,
      endTime,
      location,
      status,
      notes,
      isRecurring,
      recurrenceFrequency,
      recurrenceEndDate,
      affaire_id,
    } = req.body;

    if (!client || !date || !startTime || !endTime || !location || !type) {
      return res.status(400).json({ message: 'Missing required fields: client, date, startTime, endTime, location, type' });
    }
    if (type === 'meeting' && !aff) {
      return res.status(400).json({ message: 'aff is required for meeting type' });
    }
    if (isRecurring && recurrenceFrequency !== 'none' && !recurrenceEndDate) {
      return res.status(400).json({ message: 'recurrenceEndDate is required for recurring events' });
    }

    const clientDoc = await Client.findOne({ nom: client, avocat_id: req.avocat._id });
    if (!clientDoc) {
      return res.status(404).json({ message: 'Client not found or not authorized' });
    }

    let affaireDoc = null;
    if (affaire_id) {
      if (!mongoose.Types.ObjectId.isValid(affaire_id)) {
        return res.status(400).json({ message: 'Invalid affaire_id' });
      }
      affaireDoc = await Affaire.findOne({ _id: affaire_id, avocat_id: req.avocat._id });
      if (!affaireDoc) {
        return res.status(404).json({ message: 'Affaire not found or not authorized' });
      }
      if (aff && affaireDoc.case_number !== aff) {
        return res.status(400).json({ message: 'aff does not match affaire case_number' });
      }
    }

    const conflicts = await RendezVous.find({
      avocat_id: req.avocat._id,
      date: new Date(date),
      $or: [
        { heure_debut: { $lt: endTime }, heure_fin: { $gt: startTime } },
      ],
    }).populate('client_id', 'nom');

    if (conflicts.length > 0) {
      const formattedConflicts = conflicts.map(r => ({
        id: r._id,
        title: `${r.client_id?.nom || 'Unknown Client'} - ${r.description.includes('موعد نهائي') ? 'موعد نهائي' : eventTypes[type]?.label || 'اجتماع'}`,
        start: new Date(`${r.date.toISOString().split('T')[0]}T${r.heure_debut}`),
        end: new Date(`${r.date.toISOString().split('T')[0]}T${r.heure_fin}`),
        client: r.client_id?.nom || 'Unknown Client',
        type: r.aff ? 'meeting' : 'consultation',
      }));
      return res.status(400).json({
        message: 'Conflict with existing rendez-vous',
        conflicts: formattedConflicts,
      });
    }

    const notesData = {
      notes: notes || '',
      location: location || 'غير محدد',
    };
    const recurrenceData = isRecurring && recurrenceFrequency !== 'none' ? {
      frequency: recurrenceFrequency,
      endDate: new Date(recurrenceEndDate),
    } : { frequency: 'none', endDate: null };

    const rendezVous = new RendezVous({
      description: eventTypes[type]?.label || 'اجتماع',
      aff: type === 'meeting' ? aff : null,
      date: new Date(date),
      heure_debut: startTime,
      heure_fin: endTime,
      status: status || 'pending',
      avocat_id: req.avocat._id,
      client_id: clientDoc._id,
      affaire_id: affaire_id || null,
      notes: JSON.stringify(notesData),
      recurrence: recurrenceData,
    });

    await rendezVous.save();

    const populatedRendezVous = await RendezVous.findById(rendezVous._id)
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedRendezVous = formatRendezVous(populatedRendezVous, type);
    res.status(201).json(formattedRendezVous);
  } catch (error) {
    console.error('Error creating rendezVous:', error.message, error.stack);
    res.status(400).json({ message: 'Error creating rendezVous', error: error.message });
  }
};

exports.updateRendezVous = async (req, res) => {
  try {
    const {
      client,
      type,
      aff,
      date,
      startTime,
      endTime,
      location,
      status,
      notes,
      isRecurring,
      recurrenceFrequency,
      recurrenceEndDate,
      affaire_id,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid rendezVous ID' });
    }

    if (!client || !date || !startTime || !endTime || !location || !type) {
      return res.status(400).json({ message: 'Missing required fields: client, date, startTime, endTime, location, type' });
    }
    if (type === 'meeting' && !aff) {
      return res.status(400).json({ message: 'aff is required for meeting type' });
    }
    if (isRecurring && recurrenceFrequency !== 'none' && !recurrenceEndDate) {
      return res.status(400).json({ message: 'recurrenceEndDate is required for recurring events' });
    }

    const clientDoc = await Client.findOne({ nom: client, avocat_id: req.avocat._id });
    if (!clientDoc) {
      return res.status(404).json({ message: 'Client not found or not authorized' });
    }

    let affaireDoc = null;
    if (affaire_id) {
      if (!mongoose.Types.ObjectId.isValid(affaire_id)) {
        return res.status(400).json({ message: 'Invalid affaire_id' });
      }
      affaireDoc = await Affaire.findOne({ _id: affaire_id, avocat_id: req.avocat._id });
      if (!affaireDoc) {
        return res.status(404).json({ message: 'Affaire not found or not authorized' });
      }
      if (aff && affaireDoc.case_number !== aff) {
        return res.status(400).json({ message: 'aff does not match affaire case_number' });
      }
    }

    const conflicts = await RendezVous.find({
      avocat_id: req.avocat._id,
      date: new Date(date),
      _id: { $ne: req.params.id },
      $or: [
        { heure_debut: { $lt: endTime }, heure_fin: { $gt: startTime } },
      ],
    }).populate('client_id', 'nom');

    if (conflicts.length > 0) {
      const formattedConflicts = conflicts.map(r => ({
        id: r._id,
        title: `${r.client_id?.nom || 'Unknown Client'} - ${r.description.includes('موعد نهائي') ? 'موعد نهائي' : eventTypes[type]?.label || 'اجتماع'}`,
        start: new Date(`${r.date.toISOString().split('T')[0]}T${r.heure_debut}`),
        end: new Date(`${r.date.toISOString().split('T')[0]}T${r.heure_fin}`),
        client: r.client_id?.nom || 'Unknown Client',
        type: r.aff ? 'meeting' : 'consultation',
      }));
      return res.status(400).json({
        message: 'Conflict with existing rendez-vous',
        conflicts: formattedConflicts,
      });
    }

    const notesData = {
      notes: notes || '',
      location: location || 'غير محدد',
    };
    const recurrenceData = isRecurring && recurrenceFrequency !== 'none' ? {
      frequency: recurrenceFrequency,
      endDate: new Date(recurrenceEndDate),
    } : { frequency: 'none', endDate: null };

    const rendezVous = await RendezVous.findOneAndUpdate(
      { _id: req.params.id, avocat_id: req.avocat._id },
      {
        description: eventTypes[type]?.label || 'اجتماع',
        aff: type === 'meeting' ? aff : null,
        date: new Date(date),
        heure_debut: startTime,
        heure_fin: endTime,
        status,
        client_id: clientDoc._id,
        affaire_id: affaire_id || null,
        notes: JSON.stringify(notesData),
        recurrence: recurrenceData,
      },
      { new: true, runValidators: true }
    )
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!rendezVous) {
      return res.status(404).json({ message: 'RendezVous not found or not authorized' });
    }

    const formattedRendezVous = formatRendezVous(rendezVous, type);
    res.status(200).json(formattedRendezVous);
  } catch (error) {
    console.error('Error updating rendezVous:', error.message, error.stack);
    res.status(400).json({ message: 'Error updating rendezVous', error: error.message });
  }
};

exports.deleteRendezVous = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid rendezVous ID' });
    }

    const sessions = await Session.find({ rendez_vous_id: req.params.id });
    if (sessions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete rendez-vous as it is associated with sessions',
        sessions: sessions.map(s => ({
          id: s._id,
          salle: s.salle,
          date: s.date,
          heure_debut: s.heure_debut,
          heure_fin: s.heure_fin,
        })),
      });
    }

    const rendezVous = await RendezVous.findOneAndDelete({
      _id: req.params.id,
      avocat_id: req.avocat._id,
    });

    if (!rendezVous) {
      return res.status(404).json({ message: 'RendezVous not found or not authorized' });
    }

    res.status(200).json({ message: 'RendezVous deleted' });
  } catch (error) {
    console.error('Error deleting rendezVous:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting rendezVous', error: error.message });
  }
};

exports.getRendezVousByAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.avocatId)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }

    const rendezVous = await RendezVous.find({ avocat_id: req.params.avocatId })
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedRendezVous = rendezVous.map(r => {
      const type = r.aff ? 'meeting' : 'consultation';
      return formatRendezVous(r, type);
    });

    res.status(200).json(formattedRendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching rendez-vous', error: error.message });
  }
};

exports.getRendezVousByClient = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const rendezVous = await RendezVous.find({ client_id: req.params.clientId })
      .populate('avocat_id', 'nom prenom')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedRendezVous = rendezVous.map(r => {
      const type = r.aff ? 'meeting' : 'consultation';
      return formatRendezVous(r, type);
    });

    res.status(200).json(formattedRendezVous);
  } catch (error) {
    console.error('Error fetching rendez-vous:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching rendez-vous', error: error.message });
  }
};