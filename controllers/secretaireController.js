const Secretaire = require('../models/Secretaire');
const bcrypt = require('bcryptjs');

exports.getAllSecretaires = async (req, res) => {
  try {
    const secretaires = await Secretaire.find({ avocat_id: req.avocat._id }).populate('avocat_id', 'nom prenom');
    res.status(200).json(secretaires);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب السكرتارية', error: error.message });
  }
};

exports.getSecretaireById = async (req, res) => {
  try {
    const secretaire = await Secretaire.findOne({ _id: req.params.id, avocat_id: req.avocat._id })
      .populate('avocat_id', 'nom prenom');
    if (!secretaire) return res.status(404).json({ message: 'السكرتير غير موجود' });
    res.status(200).json(secretaire);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب السكرتير', error: error.message });
  }
};


exports.createSecretaire = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse, ville, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const secretaireData = {
      nom,
      prenom,
      telephone,
      adresse,
      ville,
      email,
      password: hashedPassword,
      avocat_id: req.avocat._id, 
    };

    const secretaire = new Secretaire(secretaireData);
    await secretaire.save();

    const populatedSecretaire = await Secretaire.findById(secretaire._id).populate('avocat_id', 'nom prenom');
    res.status(201).json(populatedSecretaire);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    } else {
      res.status(400).json({ message: 'خطأ في إنشاء السكرتير', error: error.message });
    }
  }
};

exports.updateSecretaire = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse, ville, email, password } = req.body;

    const secretaire = await Secretaire.findOne({ _id: req.params.id, avocat_id: req.avocat._id });
    if (!secretaire) return res.status(404).json({ message: 'السكرتير غير موجود' });

    secretaire.nom = nom || secretaire.nom;
    secretaire.prenom = prenom || secretaire.prenom;
    secretaire.telephone = telephone || secretaire.telephone;
    secretaire.adresse = adresse || secretaire.adresse;
    secretaire.ville = ville || secretaire.ville;
    secretaire.email = email || secretaire.email;

    if (password) {
      secretaire.password = await bcrypt.hash(password, 10);
    }

    await secretaire.save();

    const populatedSecretaire = await Secretaire.findById(secretaire._id).populate('avocat_id', 'nom prenom');
    res.status(200).json(populatedSecretaire);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    } else {
      res.status(400).json({ message: 'خطأ في تحديث السكرتير', error: error.message });
    }
  }
};

exports.deleteSecretaire = async (req, res) => {
  try {
    const secretaire = await Secretaire.findOneAndDelete({ _id: req.params.id, avocat_id: req.avocat._id });
    if (!secretaire) return res.status(404).json({ message: 'السكرتير غير موجود' });
    res.status(200).json({ message: 'تم حذف السكرتير' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف السكرتير', error: error.message });
  }
};