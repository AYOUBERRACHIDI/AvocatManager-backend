const Avocat = require('../models/Avocat');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayoubrachidi254@gmail.com',
    pass: 'wpmo qhvy lmik keha',
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Erreur de configuration email:', error);
  }
});

exports.registerValidation = [
  body('nom').notEmpty().withMessage('Nom est requis'),
  body('prenom').notEmpty().withMessage('Prénom est requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit avoir au moins 6 caractères'),
  body('telephone').notEmpty().withMessage('Téléphone requis'),
  body('adresse').notEmpty().withMessage('Adresse requise'),
  body('ville').notEmpty().withMessage('Ville requise'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Email valide requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

exports.forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email valide requis'),
];

exports.resetPasswordValidation = [
  body('email').isEmail().withMessage('Email valide requis'),
  body('otp').notEmpty().withMessage('OTP requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit avoir au moins 6 caractères'),
];

exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    const existingAvocat = await Avocat.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingAvocat || existingAdmin) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const avocat = new Avocat(req.body);
    await avocat.save();

    const token = jwt.sign({ id: avocat._id, role: 'avocat' }, process.env.JWT_SECRET || 'secret_par_defaut', {
      expiresIn: '1h',
    });

    res.status(201).json({ avocat, token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await admin.comparePassword(password))) {
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'secret_par_defaut', {
        expiresIn: '1h',
      });
      return res.status(200).json({ user: { email: admin.email, role: 'admin' }, token, role: 'admin' });
    }

    const avocat = await Avocat.findOne({ email });
    if (avocat && (await avocat.comparePassword(password))) {
      const token = jwt.sign({ id: avocat._id, role: 'avocat' }, process.env.JWT_SECRET || 'secret_par_defaut', {
        expiresIn: '1h',
      });
      return res.status(200).json({ user: avocat, token, role: 'avocat' });
    }

    return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Avocat.findOne({ email }) || await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'البريد الإلكتروني غير موجود' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 600000 });

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور - قضيتك</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; direction: rtl;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(to left, #2e7d32, #4ade80); padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 24px; margin: 10px 0;">إعادة تعيين كلمة المرور</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 30px; color: #333333;">
                    <h2 style="font-size: 20px; color: #2e7d32; margin-bottom: 20px;">رمز التحقق الخاص بك</h2>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      مرحبًا،<br>
                      لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في <strong>قضيتك</strong>. يرجى استخدام رمز التحقق التالي لإكمال العملية:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                      <span style="display: inline-block; background-color: #facc15; color: #1a4d1e; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;">${otp}</span>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      هذا الرمز صالح لمدة <strong>10 دقائق</strong>. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو التواصل مع فريق الدعم.
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

    await transporter.sendMail({
      from: '"Qadiyatuk" <ayoubrachidi254@gmail.com>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: htmlContent,
    });

    res.status(200).json({ message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ أثناء إرسال رمز التحقق', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedOtp = otpStore.get(email);

    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      return res.status(400).json({ message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
    }

    const user = await Avocat.findOne({ email }) || await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'البريد الإلكتروني غير موجود' });
    }

    user.password = newPassword;
    await user.save();
    otpStore.delete(email);

    res.status(200).json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ أثناء إعادة تعيين كلمة المرور', error: error.message });
  }
};