const mongoose = require('mongoose');
const Avocat = require('../models/Avocat');
const Secretaire = require('../models/Secretaire');
const Admin = require('../models/Admin');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cloudinary = require('../config/cloudinary');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayoubrachidi254@gmail.com',
    pass: 'wpmo qhvy lmik keha',
  },
});

const uploadToCloudinary = async (file) => {
  try {
    const fileBuffer = file.buffer.toString('base64');
    const fileType = file.mimetype.split('/')[1];
    const dataUri = `data:${file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'affaires',
      resource_type: 'image',
      upload_preset: 'affaires',
      access_mode: 'public',
    });

    if (!result.secure_url.startsWith('https://res.cloudinary.com')) {
      throw new Error('Invalid Cloudinary URL');
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalAvocats = await Avocat.countDocuments();
    const totalSecretaires = await Secretaire.countDocuments();
    const totalMessages = await Message.countDocuments();
    res.status(200).json({
      totalAvocats,
      totalSecretaires,
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

exports.getAvocats = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      $or: [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
    const avocats = await Avocat.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');
    const total = await Avocat.countDocuments(query);
    res.status(200).json({ data: avocats, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des avocats', error: error.message });
  }
};

exports.getAvocatById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }
    const avocat = await Avocat.findById(req.params.id).select('-password');
    if (!avocat) {
      return res.status(404).json({ message: 'Avocat non trouvé' });
    }
    res.status(200).json({ data: avocat });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'avocat', error: error.message });
  }
};

exports.createAvocat = async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, adresse, ville, specialiteJuridique, nomCabinet } = req.body;
    const existingAvocat = await Avocat.findOne({ email });
    if (existingAvocat) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    let logoData = {};
    if (req.file) {
      logoData = await uploadToCloudinary(req.file);
    }

    const avocat = new Avocat({
      nom,
      prenom,
      email,
      password,
      telephone,
      adresse,
      ville,
      specialiteJuridique,
      nomCabinet,
      logo: logoData.secure_url || undefined,
      logo_public_id: logoData.public_id || undefined,
    });

    await avocat.save();
    
    await new ActivityLog({
      action: 'إنشاء محامي',
      details: `المحامي: ${nom} ${prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }

    res.status(201).json({ data: { ...avocat.toObject(), password: undefined }, message: 'Avocat créé avec succès' });
  } catch (error) {
    console.error('Error creating avocat:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'avocat', error: error.message });
  }
};

exports.updateAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }
    const { nom, prenom, email, telephone, adresse, ville, specialiteJuridique, nomCabinet } = req.body;
    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) {
      return res.status(404).json({ message: 'Avocat non trouvé' });
    }
    if (email && email !== avocat.email) {
      const existingAvocat = await Avocat.findOne({ email });
      if (existingAvocat) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    let logoData = {};
    if (req.file) {
      if (avocat.logo_public_id) {
        await cloudinary.uploader.destroy(avocat.logo_public_id, { resource_type: 'image' });
      }
      logoData = await uploadToCloudinary(req.file);
    }

    avocat.nom = nom || avocat.nom;
    avocat.prenom = prenom || avocat.prenom;
    avocat.email = email || avocat.email;
    avocat.telephone = telephone || avocat.telephone;
    avocat.adresse = adresse || avocat.adresse;
    avocat.ville = ville || avocat.ville;
    avocat.specialiteJuridique = specialiteJuridique || avocat.specialiteJuridique;
    avocat.nomCabinet = nomCabinet || avocat.nomCabinet;
    avocat.logo = logoData.secure_url || avocat.logo;
    avocat.logo_public_id = logoData.public_id || avocat.logo_public_id;

    await avocat.save();
    
    await new ActivityLog({
      action: 'تحديث محامي',
      details: `المحامي: ${nom || avocat.nom} ${prenom || avocat.prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }

    res.status(200).json({ data: { ...avocat.toObject(), password: undefined }, message: 'Avocat mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating avocat:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'avocat', error: error.message });
  }
};

exports.deleteAvocat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid avocat ID' });
    }
    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) {
      return res.status(404).json({ message: 'Avocat non trouvé' });
    }

    if (avocat.logo_public_id) {
      await cloudinary.uploader.destroy(avocat.logo_public_id, { resource_type: 'image' });
    }

    await Avocat.findByIdAndDelete(req.params.id);
    
    await new ActivityLog({
      action: 'حذف محامي',
      details: `المحامي: ${avocat.nom} ${avocat.prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }

    res.status(200).json({ message: 'Avocat supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting avocat:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'avocat', error: error.message });
  }
};

exports.getSecretaires = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      $or: [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
    const secretaires = await Secretaire.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('avocat_id', 'nom prenom')
      .select('-password');
    const total = await Secretaire.countDocuments(query);
    res.status(200).json({ data: secretaires, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des secrétaires', error: error.message });
  }
};

exports.getSecretaireById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid secrétaire ID' });
    }
    const secretaire = await Secretaire.findById(req.params.id)
      .populate('avocat_id', 'nom prenom')
      .select('-password');
    if (!secretaire) {
      return res.status(404).json({ message: 'Secrétaire non trouvé' });
    }
    res.status(200).json({ data: secretaire });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du secrétaire', error: error.message });
  }
};

exports.createSecretaire = async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, adresse, ville, avocat_id } = req.body;
    const existingSecretaire = await Secretaire.findOne({ email });
    if (existingSecretaire) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const secretaire = new Secretaire({
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone,
      adresse,
      ville,
      avocat_id,
    });
    await secretaire.save();
    
    await new ActivityLog({
      action: 'إنشاء سكرتير',
      details: `السكرتير: ${nom} ${prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(201).json({ data: { ...secretaire.toObject(), password: undefined }, message: 'Secrétaire créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du secrétaire', error: error.message });
  }
};

exports.updateSecretaire = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid secrétaire ID' });
    }
    const { nom, prenom, email, telephone, adresse, ville, avocat_id, password } = req.body;
    const secretaire = await Secretaire.findById(req.params.id);
    if (!secretaire) {
      return res.status(404).json({ message: 'Secrétaire non trouvé' });
    }
    if (email && email !== secretaire.email) {
      const existingSecretaire = await Secretaire.findOne({ email });
      if (existingSecretaire) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    secretaire.nom = nom || secretaire.nom;
    secretaire.prenom = prenom || secretaire.prenom;
    secretaire.email = email || secretaire.email;
    secretaire.telephone = telephone || secretaire.telephone;
    secretaire.adresse = adresse || secretaire.adresse;
    secretaire.ville = ville || secretaire.ville;
    secretaire.avocat_id = avocat_id || secretaire.avocat_id;
    if (password) {
      secretaire.password = await bcrypt.hash(password, 10);
    }
    await secretaire.save();
    
    await new ActivityLog({
      action: 'تحديث سكرتير',
      details: `السكرتير: ${nom || secretaire.nom} ${prenom || secretaire.prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(200).json({ data: { ...secretaire.toObject(), password: undefined }, message: 'Secrétaire mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du secrétaire', error: error.message });
  }
};

exports.deleteSecretaire = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid secrétaire ID' });
    }
    const secretaire = await Secretaire.findByIdAndDelete(req.params.id);
    if (!secretaire) {
      return res.status(404).json({ message: 'Secrétaire non trouvé' });
    }
    
    await new ActivityLog({
      action: 'حذف سكرتير',
      details: `السكرتير: ${secretaire.nom} ${secretaire.prenom}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(200).json({ message: 'Secrétaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du secrétaire', error: error.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    res.status(200).json({ data: admin });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des données de l\'administrateur', error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé' });
    }
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      admin.email = email;
    }
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }
    await admin.save();
    
    await new ActivityLog({
      action: 'تحديث إعدادات الإدارة',
      details: `البريد الإلكتروني: ${email || admin.email}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(200).json({ data: { ...admin.toObject(), password: undefined }, message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres', error: error.message });
  }
};

exports.getAvocatsByCity = async (req, res) => {
  try {
    const avocatsByCity = await Avocat.aggregate([
      { $group: { _id: '$ville', count: { $sum: 1 } } },
      { $project: { city: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json(avocatsByCity);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des avocats par ville', error: error.message });
  }
};

exports.getSecretairesByAvocat = async (req, res) => {
  try {
    const secretairesByAvocat = await Secretaire.aggregate([
      {
        $lookup: {
          from: 'avocats',
          localField: 'avocat_id',
          foreignField: '_id',
          as: 'avocat',
        },
      },
      { $unwind: '$avocat' },
      {
        $group: {
          _id: '$avocat_id',
          avocat: { $first: { $concat: ['$avocat.nom', ' ', '$avocat.prenom'] } },
          count: { $sum: 1 },
        },
      },
      { $project: { avocat: 1, count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json(secretairesByAvocat);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des secrétaires par avocat', error: error.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    const newMessage = new Message({
      name,
      email,
      message,
    });
    await newMessage.save();
    
    await new ActivityLog({
      action: 'إنشاء رسالة',
      details: `المرسل: ${name}, البريد: ${email}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ],
    };
    const messages = await Message.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Message.countDocuments(query);
    res.status(200).json({ data: messages, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    if (!subject || !body) {
      return res.status(400).json({ message: 'Le sujet et le corps du message sont requis' });
    } 

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رد على رسالتك - قضيتك</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; direction: rtl;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(to left, #2e7d32, #4ade80); padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 24px; margin: 10px 0;">رد على رسالتك</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 30px; color: #333333;">
                    <h2 style="font-size: 20px; color: #2e7d32; margin-bottom: 20px;">${subject}</h2>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      مرحبًا،<br>
                      شكرًا لتواصلك مع <strong>قضيتك</strong>. فيما يلي ردنا على رسالتك:
                    </p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #333333;">${body}</p>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      إذا كانت لديك أي استفسارات إضافية، فلا تتردد في التواصل معنا. نحن هنا لمساعدتك.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                    <p style="margin: 0;">© 2025 قضيتك. جميع الحقوق محفوظة.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Qadiyatuk" <ayoubrachidi254@gmail.com>',
      to: message.email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    
    await new ActivityLog({
      action: 'رد على رسالة',
      details: `المرسل: ${message.name}, البريد: ${message.email}, الموضوع: ${subject}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(200).json({ message: 'Réponse envoyée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse', error: error.message });
  }
};
exports.deleteMessage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    await new ActivityLog({
      action: 'حذف رسالة',
      details: `المرسل: ${message.name}, البريد: ${message.email}`,
    }).save();
    
    const logsCount = await ActivityLog.countDocuments();
    if (logsCount > 6) {
      const oldestLogs = await ActivityLog.find()
        .sort({ createdAt: 1 })
        .limit(logsCount - 6);
      await ActivityLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
    }
    res.status(200).json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du message', error: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(6);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des journaux d\'activité', error: error.message });
  }
};

module.exports = exports;