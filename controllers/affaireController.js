const mongoose = require('mongoose');
const Affaire = require('../models/Affaire');
const AffaireClient = require('../models/AffaireClient');
const Paiement = require('../models/Paiement');
const Session = require('../models/Session');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (file, customName) => {
  try {
    const fileBuffer = file.buffer.toString('base64');
    const fileType = file.mimetype.split('/')[1];
    const dataUri = `data:${file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'affaires',
      resource_type: 'auto',
      upload_preset: 'affaires',
      access_mode: 'public',
      public_id: customName, 
    });

    if (!result.secure_url.startsWith('https://res.cloudinary.com')) {
      throw new Error('Invalid Cloudinary URL');
    }

    console.log('Uploaded file:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
    });

    return { url: result.secure_url, name: customName || file.originalname };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const CASE_TYPES = {
  civil: [
    'نزاعات التعويض',
    'نزاعات العقود',
    'الاستحقاق وإلغاء الهبة',
    'المسؤولية المدنية',
    'تسجيل الممتلكات',
    'نزاعات ملكية الممتلكات',
    'تقسيم الممتلكات',
    'الاستملاك للمنفعة العامة',
  ],
  criminal: [
    'الاعتداءات الجنحية',
    'السرقة، الاحتيال، خيانة الأمانة',
    'المخالفات المرورية الخطيرة',
    'القتل العمد أو الإهمال',
    'الاغتصاب والاعتداء غير اللائق',
    'الاختلاس، الرشوة، سوء الاستخدام',
    'تشكيل عصابة إجرامية',
    'المخالفات المرورية البسيطة',
    'المخالفات البيئية والصحية',
  ],
  commercial: [
    'نزاعات الشركات',
    'تأسيس الشركات',
    'تصفية الشركات',
    'نزاعات العقود التجارية',
    'نزاعات التوزيع والوكالة',
    'الإفلاس والتسوية القضائية',
  ],
  administrative: [
    'الطعون الإدارية',
    'المسؤولية الإدارية',
    'نزاعات العقود العامة',
  ],
  family: [
    'الزواج والتوثيق',
    'الطلاق',
    'النفقة والحضانة',
    'إثبات النسب',
    'الميراث والوصايا',
    'تعدد الزوجات',
    'الكفالة',
  ],
  labor: [
    'الفصل التعسفي',
    'مطالبات التعويض',
    'نزاعات الأجور والإجازات',
    'الإضرابات',
    'التفاوض الجماعي',
    'نزاعات الاتفاقيات الجماعية',
  ],
};

const populateTotalPaidAmount = async (affaires) => {
  const affaireIds = affaires.map(affaire => affaire._id);
  const payments = await Paiement.aggregate([
    { $match: { affaire_id: { $in: affaireIds.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } }
  ]);

  return affaires.map(affaire => {
    const payment = payments.find(p => p._id.toString() === affaire._id.toString());
    return {
      ...affaire.toObject(),
      total_paid_amount: payment ? payment.total_paid_amount : 0
    };
  });
};

exports.getAllAffaires = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const { sortBy = 'createdAt', order = 'desc', limit = 10 } = req.query; 
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    let affaires = await Affaire.find({ 
      avocat_id: lawyerId, 
      isArchived: false 
    })
      .sort(sortOptions)
      .limit(parseInt(limit))
      .populate('avocat_id')
      .populate('client_id');
    affaires = await populateTotalPaidAmount(affaires);
    res.status(200).json(affaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaires', error: error.message });
  }
};

exports.getAffairesByCategory = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;
    const { category } = req.params;
    const { case_level } = req.query;
    if (!Object.keys(CASE_TYPES).includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    const query = { 
      avocat_id: lawyerId, 
      isArchived: false, 
      category 
    };
    if (case_level && ['primary', 'appeal'].includes(case_level)) {
      query.case_level = case_level;
    }
    let affaires = await Affaire.find(query)
      .populate('avocat_id')
      .populate('client_id');
    affaires = await populateTotalPaidAmount(affaires);
    res.status(200).json(affaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaires by category', error: error.message });
  }
};

exports.getCaseTypes = async (req, res) => {
  try {
    res.status(200).json(CASE_TYPES);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching case types', error: error.message });
  }
};

exports.getArchivedAffaires = async (req, res) => {
  try {
    const lawyerId = req.params.avocatId;
    let affaires = await Affaire.find({ 
      avocat_id: lawyerId, 
      isArchived: true 
    })
      .populate('avocat_id')
      .populate('client_id');
    affaires = await populateTotalPaidAmount(affaires);
    res.status(200).json(affaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived affaires', error: error.message });
  }
};

exports.getAffaireById = async (req, res) => {
  try {
    let affaire = await Affaire.findById(req.params.id)
      .populate('avocat_id')
      .populate('client_id');
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } }
    ]);
    affaire = {
      ...affaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0
    };
    res.status(200).json(affaire);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaire', error: error.message });
  }
};
exports.deleteAttachment = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.filePath);
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire not found' });
    }

    const attachment = affaire.attachments.find((att) => att.url.includes(publicId));
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const fileExtension = attachment.url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
    let resourceType = 'raw'; 
    if (imageExtensions.includes(fileExtension)) {
      resourceType = 'image';
    } else if (videoExtensions.includes(fileExtension)) {
      resourceType = 'video';
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    affaire.attachments = affaire.attachments.filter((att) => !att.url.includes(publicId));
    await affaire.save();

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(affaire._id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } },
    ]);
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0,
    };

    res.status(200).json(populatedAffaire);
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
};

exports.createAffaire = async (req, res) => {
  try {
    const {
      case_level,
      primary_case_number,
      category,
      type,
      avocat_id,
      client_id,
      adversaire,
      statut,
      client_role,
      case_number,
      fee_type,
      lawyer_fees,
      case_expenses,
      attachmentNames, 
    } = req.body;

    if (!client_id || !adversaire || !client_role || !category || !type || !fee_type || !lawyer_fees) {
      return res.status(400).json({ message: 'Client, Adversaire, Client Role, Category, Type, Fee Type, and Lawyer Fees are required' });
    }
    if (!CASE_TYPES[category] || !CASE_TYPES[category].includes(type)) {
      return res.status(400).json({ message: 'Invalid category or type' });
    }
    if (client_role === 'défendeur' && !case_number) {
      return res.status(400).json({ message: 'Case number is required for défendeur' });
    }
    if (case_level === 'appeal' && !primary_case_number) {
      return res.status(400).json({ message: 'Primary case number is required for appeal cases' });
    }
    if (fee_type === 'comprehensive' && !case_expenses) {
      return res.status(400).json({ message: 'Case expenses are required for comprehensive fees' });
    }
    if (!['comprehensive', 'lawyer_only'].includes(fee_type)) {
      return res.status(400).json({ message: 'Invalid fee type' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      const parsedAttachmentNames = typeof attachmentNames === 'string' ? JSON.parse(attachmentNames) : attachmentNames || [];
      for (let i = 0; i < req.files.length; i++) {
        const customName = parsedAttachmentNames[i] || req.files[i].originalname;
        const fileData = await uploadToCloudinary(req.files[i], customName);
        attachments.push({ url: fileData.url, name: fileData.name });
      }
    }

    const affaire = new Affaire({
      case_number: client_role === 'défendeur' ? case_number : case_number || undefined,
      client_role,
      category,
      type,
      avocat_id: avocat_id || req.avocat._id,
      client_id,
      adversaire,
      statut,
      case_level: case_level || 'primary',
      primary_case_number: case_level === 'appeal' ? primary_case_number : undefined,
      fee_type,
      lawyer_fees: parseFloat(lawyer_fees),
      case_expenses: fee_type === 'comprehensive' ? parseFloat(case_expenses) : undefined,
      attachments,
    });
    await affaire.save();

    const affaireClient = new AffaireClient({
      affaire_id: affaire._id,
      client_id: client_id,
    });
    await affaireClient.save();

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: 0,
    };
    res.status(201).json(populatedAffaire);
  } catch (error) {
    console.error('Error creating affaire:', error);
    res.status(400).json({ message: 'Error creating affaire', error: error.message });
  }
};

exports.updateAffaire = async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });

    const {
      case_level,
      primary_case_number,
      category,
      type,
      avocat_id,
      client_id,
      adversaire,
      statut,
      client_role,
      case_number,
      fee_type,
      lawyer_fees,
      case_expenses,
      attachmentNames,
      existingAttachments, 
    } = req.body;

    console.log('Received update data:', req.body, 'Files:', req.files); 

    if (client_role === 'défendeur' && !case_number) {
      console.error('Validation failed: Case number required for défendeur');
      return res.status(400).json({ message: 'Case number is required for défendeur' });
    }
    if (category && type && (!CASE_TYPES[category] || !CASE_TYPES[category].includes(type))) {
      console.error('Validation failed: Invalid category or type', { category, type });
      return res.status(400).json({ message: 'Invalid category or type' });
    }
    if (case_level === 'appeal' && !primary_case_number) {
      console.error('Validation failed: Primary case number required for appeal');
      return res.status(400).json({ message: 'Primary case number is required for appeal cases' });
    }
    if (fee_type === 'comprehensive' && !case_expenses) {
      console.error('Validation failed: Case expenses required for comprehensive fees');
      return res.status(400).json({ message: 'Case expenses are required for comprehensive fees' });
    }
    if (fee_type && !['comprehensive', 'lawyer_only'].includes(fee_type)) {
      console.error('Validation failed: Invalid fee type', { fee_type });
      return res.status(400).json({ message: 'Invalid fee type' });
    }

    const newAttachments = [];
    if (req.files && req.files.length > 0) {
      const parsedAttachmentNames = typeof attachmentNames === 'string' ? JSON.parse(attachmentNames) : attachmentNames || [];
      for (let i = 0; i < req.files.length; i++) {
        const customName = parsedAttachmentNames[i] || req.files[i].originalname;
        const fileData = await uploadToCloudinary(req.files[i], customName);
        newAttachments.push({ url: fileData.url, name: fileData.name });
      }
    }

    const parsedExistingAttachments = typeof existingAttachments === 'string' ? JSON.parse(existingAttachments) : existingAttachments || [];
    affaire.attachments = [...parsedExistingAttachments, ...newAttachments];

    affaire.category = category || affaire.category;
    affaire.type = type || affaire.type;
    affaire.avocat_id = avocat_id || affaire.avocat_id;
    affaire.client_id = client_id || affaire.client_id;
    affaire.adversaire = adversaire || affaire.adversaire;
    affaire.statut = statut || affaire.statut;
    affaire.client_role = client_role || affaire.client_role;
    affaire.case_number = client_role === 'défendeur' ? case_number : case_number || affaire.case_number;
    affaire.case_level = case_level || affaire.case_level;
    affaire.primary_case_number = case_level === 'appeal' ? primary_case_number : undefined;
    affaire.fee_type = fee_type || affaire.fee_type;
    affaire.lawyer_fees = lawyer_fees ? parseFloat(lawyer_fees) : affaire.lawyer_fees;
    affaire.case_expenses = fee_type === 'comprehensive' ? parseFloat(case_expenses) : undefined;

    await affaire.save();

    if (client_id && client_id !== affaire.client_id.toString()) {
      await AffaireClient.findOneAndUpdate(
        { affaire_id: affaire._id },
        { client_id: client_id },
        { upsert: true }
      );
    }

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(affaire._id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } },
    ]);
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0,
    };
    res.status(200).json(populatedAffaire);
  } catch (error) {
    console.error('Error updating affaire:', error);
    res.status(400).json({ message: 'Error updating affaire', error: error.message });
  }
};

exports.addAttachments = async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });

    const { attachmentNames } = req.body;
    const newAttachments = [];
    if (req.files && req.files.length > 0) {
      const parsedAttachmentNames = typeof attachmentNames === 'string' ? JSON.parse(attachmentNames) : attachmentNames || [];
      for (let i = 0; i < req.files.length; i++) {
        const customName = parsedAttachmentNames[i] || req.files[i].originalname;
        const fileData = await uploadToCloudinary(req.files[i], customName);
        newAttachments.push({ url: fileData.url, name: fileData.name });
      }
    }
    if (newAttachments.length === 0) {
      return res.status(400).json({ message: 'No attachments provided' });
    }

    affaire.attachments = [...(affaire.attachments || []), ...newAttachments];
    await affaire.save();

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(affaire._id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } },
    ]);
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0,
    };
    res.status(200).json(populatedAffaire);
  } catch (error) {
    console.error('Error adding attachments:', error);
    res.status(400).json({ message: 'Error adding attachments', error: error.message });
  }
};

exports.archiveAffaire = async (req, res) => {
  try {
    const { remarks } = req.body;
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });

    affaire.isArchived = true;
    affaire.statut = 'archived';
    affaire.archivedAt = new Date();
    affaire.archiveRemarks = remarks || '';
    await affaire.save();

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(affaire._id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } }
    ]);
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0
    };

    res.status(200).json(populatedAffaire);
  } catch (error) {
    console.error('Error archiving affaire:', error);
    res.status(500).json({ message: 'Error archiving affaire', error: error.message });
  }
};

exports.restoreAffaire = async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });

    affaire.isArchived = false;
    affaire.statut = 'en cours';
    affaire.archivedAt = null;
    affaire.archiveRemarks = '';
    await affaire.save();

    let populatedAffaire = await Affaire.findById(affaire._id)
      .populate('avocat_id')
      .populate('client_id');
    const payments = await Paiement.aggregate([
      { $match: { affaire_id: new mongoose.Types.ObjectId(affaire._id) } },
      { $group: { _id: '$affaire_id', total_paid_amount: { $sum: '$paid_amount' } } }
    ]);
    populatedAffaire = {
      ...populatedAffaire.toObject(),
      total_paid_amount: payments.length > 0 ? payments[0].total_paid_amount : 0
    };

    res.status(200).json(populatedAffaire);
  } catch (error) {
    console.error('Error restoring affaire:', error);
    res.status(500).json({ message: 'Error restoring affaire', error: error.message });
  }
};

exports.deleteAffaire = async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) return res.status(404).json({ message: 'Affaire not found' });

    if (affaire.attachments && affaire.attachments.length > 0) {
      for (const attachment of affaire.attachments) {
        const publicId = attachment.url.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      }
    }

    await AffaireClient.deleteMany({ affaire_id: req.params.id });
    await Affaire.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Affaire deleted permanently' });
  } catch (error) {
    console.error('Error deleting affaire:', error);
    res.status(500).json({ message: 'Error deleting affaire', error: error.message });
  }
};

exports.getAffairesByClientId = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const affaireClients = await AffaireClient.find({ client_id: clientId }).select('affaire_id');

    if (!affaireClients.length) {
      return res.status(404).json({ message: 'No affaires found for this client' });
    }

    const affaireIds = affaireClients.map(ac => ac.affaire_id);
    let affaires = await Affaire.find({ 
      _id: { $in: affaireIds }, 
      isArchived: false 
    })
      .populate('avocat_id')
      .populate('client_id');
    affaires = await populateTotalPaidAmount(affaires);
    res.status(200).json(affaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaires by client', error: error.message });
  }
};

exports.getAffairesByAvocatId = async (req, res) => {
  try {
    const avocatId = req.params.avocatId;
    let affaires = await Affaire.find({ 
      avocat_id: avocatId, 
      isArchived: false 
    })
      .populate('avocat_id')
      .populate('client_id');
    affaires = await populateTotalPaidAmount(affaires);
    if (!affaires.length) {
      return res.status(404).json({ message: 'No affaires found for this avocat' });
    }
    res.status(200).json(affaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching affaires by avocat', error: error.message });
  }
};

const verifyFileExists = async (publicId) => {
  const typesToTry = ['image', 'raw', 'auto'];
  for (const type of typesToTry) {
    try {
      console.log(`Checking file with publicId: ${publicId}, resource_type: ${type}`);
      const resource = await cloudinary.api.resource(publicId, { resource_type: type });
      console.log(`File found with resource_type: ${type}, format: ${resource.format}`);
      return { exists: true, resourceType: type, format: resource.format };
    } catch (err) {
      console.warn(`Not found with resource_type ${type}:`, err);
    }
  }
  console.error(`No file found for publicId: ${publicId} across all resource types`);
  return { exists: false, resourceType: null, format: null };
};


exports.downloadAttachment = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.filePath);
    if (!publicId) {
      return res.status(400).json({ message: 'Invalid public ID' });
    }

    const affaire = await Affaire.findOne({ 'attachments.url': { $regex: publicId, $options: 'i' } });
    if (!affaire) {
      return res.status(404).json({ message: 'Attachment not found in any affaire' });
    }

    const attachment = affaire.attachments.find((att) => att.url.includes(publicId));
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const { exists, resourceType, format } = await verifyFileExists(publicId);
    if (!exists) {
      return res.status(404).json({ message: 'File not found in Cloudinary' });
    }

    const extension = format || 'bin';
    const fileName = `${attachment.name}.${extension}`; 
    let signedUrl;

    if (resourceType === 'image') {
      signedUrl = cloudinary.url(`${publicId}.${extension}`, {
        resource_type: 'image',
        type: 'upload',
        flags: 'attachment',
        sign_url: true,
        secure: true,
      });
    } else {
      signedUrl = cloudinary.utils.private_download_url(publicId, extension, {
        resource_type: resourceType,
        attachment: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });
    }

    if (!signedUrl.startsWith('https://res.cloudinary.com')) {
      return res.status(500).json({ message: 'Generated signed URL is invalid' });
    }

    return res.status(200).json({ signedUrl, fileName });
  } catch (error) {
    console.error('❌ Error generating download URL:', error);
    return res.status(500).json({ message: 'Error generating download URL', error: error.message });
  }
};






exports.previewAttachment = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.filePath);
    if (!publicId) return res.status(400).json({ message: 'Invalid public ID' });

    const affaire = await Affaire.findOne({ 'attachments.url': { $regex: publicId, $options: 'i' } });
    if (!affaire) {
      return res.status(404).json({ message: 'Attachment not found in any affaire' });
    }

    const attachment = affaire.attachments.find(att => att.url.includes(publicId));
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const { exists, resourceType, format } = await verifyFileExists(publicId);
    if (!exists) return res.status(404).json({ message: 'File not found in Cloudinary' });

    const fileType = format?.toLowerCase() || 'pdf';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(fileType)) {
      return res.status(400).json({ message: 'Unsupported file type for preview' });
    }

    const previewUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });

    res.status(200).json({ 
      signedUrl: previewUrl,
      fileType,
      fileName: attachment.name
    });
  } catch (error) {
    console.error('Error generating preview URL:', error);
    res.status(500).json({ message: 'Error generating preview URL', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const lawyerId = req.avocat._id;

    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const totalCases = await Affaire.countDocuments({
      avocat_id: lawyerId,
      isArchived: false,
    });

    const previousTotalCases = await Affaire.countDocuments({
      avocat_id: lawyerId,
      isArchived: false,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const totalClients = await Affaire.distinct('client_id', {
      avocat_id: lawyerId,
      isArchived: false,
    }).then(clients => clients.length);

    const previousTotalClients = await Affaire.distinct('client_id', {
      avocat_id: lawyerId,
      isArchived: false,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }).then(clients => clients.length);

    const totalSessions = await Session.countDocuments({
      avocat_id: lawyerId,
      status: { $ne: 'cancelled' },
    });

    const previousTotalSessions = await Session.countDocuments({
      avocat_id: lawyerId,
      status: { $ne: 'cancelled' },
      start: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const totalConsultations = 0;
    const previousTotalConsultations = 0;

    res.status(200).json({
      totalClients,
      previousTotalClients,
      totalSessions,
      previousTotalSessions,
      totalCases,
      previousTotalCases,
      totalConsultations,
      previousTotalConsultations,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};