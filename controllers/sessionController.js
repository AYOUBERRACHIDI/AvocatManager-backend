const mongoose = require('mongoose');
const Session = require('../models/Session');
const Client = require('../models/Client');
const Affaire = require('../models/Affaire');
const Avocat = require('../models/Avocat');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');



const formatSession = (session) => ({
  _id: session._id,
  remarque: session.remarque || '',
  ordre: session.ordre,
  emplacement: session.emplacement,
  start: new Date(`${session.date.toISOString().split('T')[0]}T${session.heure_debut}`),
  end: new Date(`${session.date.toISOString().split('T')[0]}T${session.heure_fin}`),
  client: session.client_id?.nom || 'Unknown Client',
  client_id: session.client_id?._id || null,
  status: session.status,
  affaire_id: session.affaire_id?._id ? { _id: session.affaire_id._id, case_number: session.affaire_id.case_number } : null,
  case_number: session.case_number || '',
  gouvernance: session.gouvernance || '',
  color: '#2e7d32',
});

const formatDateInFrench = (date) => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).split('/').join('/');
};

const fixArabicLabel = (label) => {
  if (!label) return '';
  
  const arabicRegex = /[\u0600-\u06FF]/;
  
  if (arabicRegex.test(label)) {
    const words = label.trim().split(/\s+/);
    
    if (words.length > 1) {
      return words.reverse().join(' ');
    }
        return label;
  }
  
  return label;
};



exports.getAllSessions = async (req, res) => {
  try {
    if (!req.avocat || !req.avocat._id) {
      return res.status(401).json({ message: 'Unauthorized: Avocat ID not found' });
    }
    const sessions = await Session.find({ avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedSessions = sessions.map(formatSession);
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    console.log('getSessionById called with ID:', req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid session ID:', req.params.id);
      return res.status(400).json({ message: `Invalid session ID: ${req.params.id}` });
    }

    const session = await Session.findOne({ _id: req.params.id, avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!session) {
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }

    const formattedSession = formatSession(session);
    res.status(200).json(formattedSession);
  } catch (error) {
    console.error('Error fetching session:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const {
      remarque,
      ordre,
      emplacement,
      date,
      heure_debut,
      heure_fin,
      client,
      status,
      affaire_id,
      gouvernance,
    } = req.body;

    if (!ordre || !emplacement || !date || !heure_debut || !heure_fin || !client) {
      console.error('Missing required fields:', { ordre, emplacement, date, heure_debut, heure_fin, client });
      return res.status(400).json({
        message: 'Missing required fields: ordre, emplacement, date, heure_debut, heure_fin, client',
      });
    }

    if (isNaN(ordre) || ordre < 0) {
      console.error('Invalid ordre value:', ordre);
      return res.status(400).json({ message: 'Invalid ordre value' });
    }

    const clientDoc = await Client.findOne({ nom: client, avocat_id: req.avocat._id });
    if (!clientDoc) {
      console.error('Client not found:', client);
      return res.status(404).json({ message: 'Client not found or not authorized' });
    }

    let affaireDoc = null;
    let case_number = '';
    if (affaire_id && affaire_id !== 'null') {
      if (!mongoose.Types.ObjectId.isValid(affaire_id)) {
        console.error('Invalid affaire_id:', affaire_id);
        return res.status(400).json({ message: 'Invalid affaire_id' });
      }
      affaireDoc = await Affaire.findOne({ _id: affaire_id, avocat_id: req.avocat._id });
      if (!affaireDoc) {
        console.error('Affaire not found:', affaire_id);
        return res.status(404).json({ message: 'Affaire not found or not authorized' });
      }
      case_number = affaireDoc.case_number || '';
    }

    const conflicts = await Session.find({
      avocat_id: req.avocat._id,
      date: new Date(date),
      $or: [
        { heure_debut: { $lt: heure_fin }, heure_fin: { $gt: heure_debut } },
      ],
    }).populate('client_id', 'nom');

    if (conflicts.length > 0) {
      const formattedConflicts = conflicts.map(s => ({
        id: s._id,
        title: `${s.client_id?.nom || 'Unknown Client'} - جلسة`,
        start: new Date(`${s.date.toISOString().split('T')[0]}T${s.heure_debut}`),
        end: new Date(`${s.date.toISOString().split('T')[0]}T${s.heure_fin}`),
        startTime: s.heure_debut,
        endTime: s.heure_fin,
        date: new Date(s.date).toLocaleDateString('ar'),
        client: s.client_id?.nom || 'Unknown Client',
        conflictDetails: `جلسة للعميل ${s.client_id?.nom || 'غير معروف'} في ${new Date(s.date).toLocaleDateString('ar')} من ${s.heure_debut} إلى ${s.heure_fin}`,
      }));
      console.error('Time conflict detected:', formattedConflicts);
      return res.status(400).json({
        message: 'تضارب في موعد الجلسة مع جلسات أخرى',
        conflicts: formattedConflicts,
      });
    }

    const session = new Session({
      remarque,
      ordre,
      emplacement,
      date: new Date(date),
      heure_debut,
      heure_fin,
      status: status || 'pending',
      avocat_id: req.avocat._id,
      client_id: clientDoc._id,
      affaire_id: affaireDoc ? affaireDoc._id : null,
      case_number,
      gouvernance: gouvernance || '',
    });

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedSession = formatSession(populatedSession);
    res.status(201).json(formattedSession);
  } catch (error) {
    console.error('Error creating session:', error.message, error.stack);
    res.status(400).json({ message: 'Error creating session', error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const {
      remarque,
      ordre,
      emplacement,
      date,
      heure_debut,
      heure_fin,
      client,
      status,
      affaire_id,
      gouvernance,
    } = req.body;

    console.log('updateSession called with ID:', req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid session ID:', req.params.id);
      return res.status(400).json({ message: `Invalid session ID: ${req.params.id}` });
    }

    if (!ordre || !emplacement || !date || !heure_debut || !heure_fin || !client) {
      console.error('Missing required fields:', { ordre, emplacement, date, heure_debut, heure_fin, client });
      return res.status(400).json({
        message: 'Missing required fields: ordre, emplacement, date, heure_debut, heure_fin, client',
      });
    }

    if (isNaN(ordre) || ordre < 0) {
      console.error('Invalid ordre value:', ordre);
      return res.status(400).json({ message: 'Invalid ordre value' });
    }

    const clientDoc = await Client.findOne({ nom: client, avocat_id: req.avocat._id });
    if (!clientDoc) {
      console.error('Client not found:', client);
      return res.status(404).json({ message: 'Clientबर not found or not authorized' });
    }

    let affaireDoc = null;
    let case_number = '';
    if (affaire_id && affaire_id !== 'null') {
      if (!mongoose.Types.ObjectId.isValid(affaire_id)) {
        console.error('Invalid affaire_id:', affaire_id);
        return res.status(400).json({ message: 'Invalid affaire_id' });
      }
      affaireDoc = await Affaire.findOne({ _id: affaire_id, avocat_id: req.avocat._id });
      if (!affaireDoc) {
        console.error('Affaire not found:', affaire_id);
        return res.status(404).json({ message: 'Affaire not found or not authorized' });
      }
      case_number = affaireDoc.case_number || '';
    }

    const conflicts = await Session.find({
      avocat_id: req.avocat._id,
      date: new Date(date),
      _id: { $ne: req.params.id },
      $or: [
        { heure_debut: { $lt: heure_fin }, heure_fin: { $gt: heure_debut } },
      ],
    }).populate('client_id', 'nom');

    if (conflicts.length > 0) {
      const formattedConflicts = conflicts.map(s => ({
        id: s._id,
        title: `${s.client_id?.nom || 'Unknown Client'} - جلسة`,
        start: new Date(`${s.date.toISOString().split('T')[0]}T${s.heure_debut}`),
        end: new Date(`${s.date.toISOString().split('T')[0]}T${s.heure_fin}`),
        startTime: s.heure_debut,
        endTime: s.heure_fin,
        date: new Date(s.date).toLocaleDateString('ar'),
        client: s.client_id?.nom || 'Unknown Client',
        conflictDetails: `جلسة للعميل ${s.client_id?.nom || 'غير معروف'} في ${new Date(s.date).toLocaleDateString('ar')} من ${s.heure_debut} إلى ${s.heure_fin}`,
      }));
      console.error('Time conflict detected:', formattedConflicts);
      return res.status(400).json({
        message: 'تضارب في موعد الجلسة مع جلسات أخرى',
        conflicts: formattedConflicts,
      });
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, avocat_id: req.avocat._id },
      {
        remarque,
        ordre,
        emplacement,
        date: new Date(date),
        heure_debut,
        heure_fin,
        status,
        client_id: clientDoc._id,
        affaire_id: affaireDoc ? affaireDoc._id : null,
        case_number,
        gouvernance: gouvernance || '',
      },
      { new: true, runValidators: true }
    )
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!session) {
      console.error('Session not found:', req.params.id);
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }

    const formattedSession = formatSession(session);
    res.status(200).json(formattedSession);
  } catch (error) {
    console.error('Error updating session:', error.message, error.stack);
    res.status(400).json({ message: 'Error updating session', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    console.log('deleteSession called with ID:', req.params.id); 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid session ID:', req.params.id);
      return res.status(400).json({ message: `Invalid session ID: ${req.params.id}` });
    }

    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      avocat_id: req.avocat._id,
    });

    if (!session) {
      console.error('Session not found:', req.params.id);
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }

    res.status(200).json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};

exports.getSessionsByAvocat = async (req, res) => {
  try {
    console.log('getSessionsByAvocat called with avocatId:', req.params.avocatId); 
    if (!mongoose.Types.ObjectId.isValid(req.params.avocatId)) {
      console.error('Invalid avocat ID:', req.params.avocatId);
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }

    const sessions = await Session.find({ avocat_id: req.params.avocatId })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedSessions = sessions.map(formatSession);
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionsByClient = async (req, res) => {
  try {
    console.log('getSessionsByClient called with clientId:', req.params.clientId); 
    if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
      console.error('Invalid client ID:', req.params.clientId);
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const sessions = await Session.find({ client_id: req.params.clientId })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedSessions = sessions.map(formatSession);
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionsByDay = async (req, res) => {
  try {
    console.log('getSessionsByDay called with query:', req.query); 
    const { date } = req.query; 
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date value:', date);
      return res.status(400).json({ message: 'Invalid date value. Please provide a valid date.' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await Session.find({
      avocat_id: req.avocat._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    const formattedSessions = sessions.map(formatSession);
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions by day:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching sessions for the day', error: error.message });
  }
};
exports.generateSessionPDF = async (req, res) => {
  try {
    console.log('generateSessionPDF called with ID:', req.params.id); 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid session ID:', req.params.id);
      return res.status(400).json({ message: `Invalid session ID: ${req.params.id}` });
    }

    const session = await Session.findOne({ _id: req.params.id, avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!session) {
      console.error('Session not found:', req.params.id);
      return res.status(404).json({ message: 'Session not found or not authorized' });
    }

    if (!session.client_id?.nom || !session.ordre || !session.emplacement || !session.date || !session.heure_debut || !session.heure_fin) {
      console.error('Missing required session fields for PDF:', session);
      return res.status(400).json({ message: 'Session data incomplete for PDF generation' });
    }

    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Amiri-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      console.error('Font file not found:', fontPath);
      return res.status(500).json({ message: 'Font file not found. Please ensure Amiri-Regular.ttf is available in public/fonts/' });
    }

    let logoBuffer = null;
    if (session.avocat_id?.logo) {
      const logoUrl = `http://localhost:5000/${session.avocat_id.logo}`;
      try {
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        logoBuffer = Buffer.from(response.data, 'binary');
      } catch (error) {
        console.error('Error fetching logo:', error.message);
      }
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      info: {
        Title: `Session Report - ${session._id}`,
        Author: 'Lawyer Management System',
        Subject: 'Session Details',
        CreationDate: new Date(),
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=session_${session._id}.pdf`);

    doc.pipe(res);
    doc.font(fontPath);

    const greenColor = '#2e7d32';
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const usableWidth = pageWidth - 2 * margin;

    const headerHeight = 60;
    doc.rect(margin, margin, usableWidth, headerHeight).fill(greenColor);
    doc.fillColor('#FFFFFF');

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, margin + 10, margin + 5, { width: 40, height: 40 });
      } catch (error) {
        console.error('Error rendering logo in PDF:', error.message);
      }
    }

    const headerTextStartY = margin + 10;
    doc
      .fontSize(14)
      .text(fixArabicLabel(`الأستاذ ${session.avocat_id?.prenom || ''} ${session.avocat_id?.nom || ''}`), margin, headerTextStartY, { align: 'right', width: usableWidth })
      .fontSize(9)
      .text(fixArabicLabel('محامي معتمد لدى المحاكم'), margin, headerTextStartY + 15, { align: 'right', width: usableWidth })
      .text(fixArabicLabel(`البريد الإلكتروني: ${session.avocat_id?.email || 'غير متوفر'}`), margin, headerTextStartY + 30, { align: 'right', width: usableWidth });

    const titleY = margin + headerHeight + 20;
    doc
      .fillColor(greenColor)
      .fontSize(16)
      .text(fixArabicLabel('تقرير الجلسة'), margin, titleY, { align: 'center', width: usableWidth });

    const refDateY = titleY + 25;
    doc
      .fillColor('#000000')
      .fontSize(9)
      .text(fixArabicLabel(`المرجع: ${session._id}`), margin, refDateY, { align: 'left', width: usableWidth / 2 })
      .text(fixArabicLabel(`التاريخ: ${formatDateInFrench(new Date(session.date))}`), margin + usableWidth / 2, refDateY, { align: 'right', width: usableWidth / 2 });

    const separatorY = refDateY + 15;
    doc
      .moveTo(margin, separatorY)
      .lineTo(pageWidth - margin, separatorY)
      .stroke(greenColor);

    let currentY = separatorY + 20;
    const details = [
      { label: 'الموقع', value: session.emplacement || 'غير متوفر' },
      { label: 'التاريخ', value: formatDateInFrench(new Date(session.date)) },
      // { label: 'وقت البدء', value: session.heure_debut || 'غير متوفر' },
      // { label: 'وقت الانتهاء', value: session.heure_fin || 'غير متوفر' },
      { label: 'الترتيب', value: session.ordre?.toString() || 'غير متوفر' },
    ];

    details.forEach(detail => {
      doc
        .fillColor('#374151')
        .fontSize(10)
        .text(fixArabicLabel(`${detail.label}: ${detail.value}`), margin, currentY, { align: 'right', width: usableWidth });
      currentY += 15;
    });

    const tableTop = currentY + 20;
    const tableHeaders = ['النتيجة', 'الإجراء', 'الموكل', 'رقم الملف'];
    const tableData = [
      [
        session.remarque || 'غير متوفر',
        session.gouvernance || 'غير متوفر',
        session.client_id?.nom || 'غير معروف',
        session.affaire_id?.case_number || 'غير محدد',
      ],
    ];

    const columnWidths = [120, 120, 155, 120];
    currentY = tableTop;

    doc.fillColor(greenColor).fontSize(10);
    tableHeaders.forEach((header, index) => {
      const x = margin + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
      doc.text(fixArabicLabel(header), x, currentY, { width: columnWidths[index], align: 'right' });
    });

    currentY += 20;
    doc.fillColor('#000000').fontSize(9);
    tableData.forEach(row => {
      row.forEach((cell, index) => {
        const x = margin + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
        doc.text(fixArabicLabel(cell), x, currentY, { width: columnWidths[index], align: 'right' });
      });
      currentY += 20;
    });

    const tableHeight = currentY - tableTop + 10;
    doc
      .rect(margin, tableTop, usableWidth, tableHeight)
      .stroke(greenColor);

    const footerHeight = 40;
    const footerTop = pageHeight - margin - footerHeight;
    doc
      .fillColor(greenColor)
      .rect(margin, footerTop, usableWidth, footerHeight)
      .fill()
      .fillColor('#FFFFFF')
      .fontSize(8)
      .text(fixArabicLabel(`تم إنشاء هذا التقرير بتاريخ: ${formatDateInFrench(new Date())}`), margin, footerTop + 8, { align: 'left', width: usableWidth / 3 })
      .text(fixArabicLabel(`البريد الإلكتروني: ${session.avocat_id?.email || 'غير متوفر'}`), margin + usableWidth / 3, footerTop + 8, { align: 'center', width: usableWidth / 3 })
      .text(fixArabicLabel('مكتب المحاماة - الدفاع عن حقوقكم'), margin + (2 * usableWidth) / 3, footerTop + 8, { align: 'right', width: usableWidth / 3 });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error.message, error.stack);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

exports.generateSessionsByDayPDF = async (req, res) => {
  try {
    console.log('generateSessionsByDayPDF called with query:', req.query);
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date value:', date);
      return res.status(400).json({ message: 'Invalid date value. Please provide a valid date.' });
    }

    if (!req.avocat || !req.avocat._id) {
      console.error('Unauthorized request: Avocat ID not found');
      return res.status(401).json({ message: 'Unauthorized: Avocat ID not found' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Fetching sessions for date range:', startOfDay, 'to', endOfDay); 

    const sessions = await Session.find({
      avocat_id: req.avocat._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('avocat_id', 'nom prenom email logo')
      .populate('client_id', 'nom')
      .populate('affaire_id', 'case_number')
      .lean();

    if (!sessions || sessions.length === 0) {
      console.log('No sessions found for date:', date);
      return res.status(404).json({ message: 'No sessions found for the selected day' });
    }

    console.log('Found sessions:', sessions.length);

    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Amiri-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      console.error('Font file not found:', fontPath);
      return res.status(500).json({ message: 'Font file not found. Please ensure Amiri-Regular.ttf is available in public/fonts/' });
    }

    let logoBuffer = null;
    if (sessions[0].avocat_id?.logo) {
      const logoUrl = `http://localhost:5000/${sessions[0].avocat_id.logo}`;
      try {
        const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
        logoBuffer = Buffer.from(response.data, 'binary');
      } catch (error) {
        console.error('Error fetching logo:', error.message);
      }
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      info: {
        Title: `Sessions Report - ${date}`,
        Author: 'Lawyer Management System',
        Subject: 'Daily Sessions',
        CreationDate: new Date(),
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sessions_${date}.pdf`);

    doc.pipe(res);
    doc.font(fontPath);

    const greenColor = '#2e7d32';
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const usableWidth = pageWidth - 2 * margin;

    const headerHeight = 80;
    doc
      .fillColor(greenColor)
      .rect(margin, margin, usableWidth, headerHeight)
      .fill()
      .fillColor('#FFFFFF');

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, margin + 10, margin + 10, { width: 50, height: 50 });
      } catch (error) {
        console.error('Error rendering logo in PDF:', error.message);
      }
    }

    const headerTextStartY = margin + 15;
    doc
      .fontSize(16)
      .text(fixArabicLabel(`الأستاذ ${sessions[0].avocat_id?.prenom || ''} ${sessions[0].avocat_id?.nom || ''}`), margin, headerTextStartY, { align: 'right', width: usableWidth })
      .fontSize(10)
      .text(fixArabicLabel('محامي معتمد لدى المحاكم'), margin, headerTextStartY + 20, { align: 'right', width: usableWidth })
      .text(fixArabicLabel(`البريد الإلكتروني: ${sessions[0].avocat_id?.email || 'غير متوفر'}`), margin, headerTextStartY + 35, { align: 'right', width: usableWidth });

    const titleY = margin + headerHeight + 20;
    doc
      .fillColor(greenColor)
      .fontSize(18)
      .text(fixArabicLabel(`جلسات اليوم - ${formatDateInFrench(new Date(date))}`), margin, titleY, { align: 'center', width: usableWidth });

    const separatorY = titleY + 30;
    doc
      .lineWidth(2)
      .moveTo(margin, separatorY)
      .lineTo(pageWidth - margin, separatorY)
      .stroke(greenColor);

    let currentY = separatorY + 20;
    sessions.forEach((session, index) => {
      if (currentY + 150 > pageHeight - margin - 60) {
        doc.addPage();
        currentY = margin;
      }

      doc
        .fillColor(greenColor)
        .fontSize(14)
        .text(fixArabicLabel(`الجلسة ${index + 1}`), margin, currentY, { align: 'right', width: usableWidth });
      currentY += 20;

      const details = [
        { label: 'الموقع', value: session.emplacement || 'غير متوفر' },
        { label: 'التاريخ', value: formatDateInFrench(new Date(session.date)) },
        // { label: 'وقت البدء', value: session.heure_debut || 'غير متوفر' },
        // { label: 'وقت الانتهاء', value: session.heure_fin || 'غير متوفر' },
        { label: 'الترتيب', value: session.ordre?.toString() || 'غير متوفر' },
      ];

      details.forEach(detail => {
        doc
          .fillColor('#374151')
          .fontSize(10)
          .text(fixArabicLabel(`${detail.label}: ${detail.value}`), margin + 20, currentY, { align: 'right', width: usableWidth - 20 });
        currentY += 15;
      });

      const tableTop = currentY + 10;
      const tableHeaders = ['النتيجة', 'الإجراء', 'الموكل', 'رقم الملف'];
      const tableData = [
        [
          session.remarque || '',
          session.gouvernance || '',
          session.client_id?.nom || '',
          session.affaire_id?.case_number || '',
        ],
      ];

      const columnWidths = [120, 120, 155, 120];

      doc
        .fillColor(greenColor)
        .fontSize(11)
        .rect(margin, tableTop, usableWidth, 25)
        .fill()
        .fillColor('#FFFFFF');
      tableHeaders.forEach((header, idx) => {
        const x = margin + columnWidths.slice(0, idx).reduce((sum, w) => sum + w, 0);
        doc.text(fixArabicLabel(header), x + 5, tableTop + 7, { width: columnWidths[idx] - 10, align: 'right' });
      });

      currentY = tableTop + 25;
      doc.fillColor('#000000').fontSize(9);
      tableData.forEach((row, rowIndex) => {
        const rowHeight = rowIndex === 0 ? 50 : 30;
        doc
          .rect(margin, currentY, usableWidth, rowHeight)
          .fill('#F5F7FA')
          .fillColor('#000000');
        row.forEach((cell, idx) => {
          const x = margin + columnWidths.slice(0, idx).reduce((sum, w) => sum + w, 0);
          doc.text(fixArabicLabel(cell), x + 5, currentY + 5, { width: columnWidths[idx] - 10, align: 'right' });
        });
        currentY += rowHeight;
      });

      doc
        .lineWidth(1)
        .rect(margin, tableTop, usableWidth, currentY - tableTop)
        .stroke(greenColor);

      currentY += 20;
    });

    const footerHeight = 40;
    const footerTop = pageHeight - margin - footerHeight;
    doc
      .fillColor(greenColor)
      .rect(margin, footerTop, usableWidth, footerHeight)
      .fill()
      .fillColor('#FFFFFF')
      .fontSize(9)
      .text(fixArabicLabel(`تم إنشاء هذا التقرير بتاريخ: ${formatDateInFrench(new Date())}`), margin, footerTop + 10, { align: 'left', width: usableWidth / 3 })
      .text(fixArabicLabel(`البريد الإلكتروني: ${sessions[0].avocat_id?.email || 'غير متوفر'}`), margin + usableWidth / 3, footerTop + 10, { align: 'center', width: usableWidth / 3 })
      .text(fixArabicLabel('مكتب المحاماة - الدفاع عن حقوقكم'), margin + (2 * usableWidth) / 3, footerTop + 10, { align: 'right', width: usableWidth / 3 });

    doc.end();
  } catch (error) {
    console.error('Error generating daily sessions PDF:', error.message, error.stack);
    res.status(500).json({ message: 'Error generating daily sessions PDF', error: error.message });
  }
};