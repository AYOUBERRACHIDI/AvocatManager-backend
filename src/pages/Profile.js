import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import NavDash from '../components/NavDash';
import Sidebar from '../components/Sidebar';
import { FaUser, FaEnvelope, FaPhone, FaPaperclip, FaMapMarkerAlt, FaCity, FaSave, FaEdit, FaLock, FaGavel, FaBuilding } from 'react-icons/fa';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const errorFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  direction: rtl;
`;

const MainContent = styled.div`
  flex: 1;
  margin-right: 70px;
  margin-top: 60px;
  padding: 2.5rem;
  overflow-y: auto;

  @media (max-width: 1024px) {
    padding: 2rem;
  }
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-right: 0;
  }
`;

const ProfileSection = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem;
  border: 2px solid #2e7d32;
  animation: ${css`${fadeIn} 0.8s ease-in-out forwards`};

  @media (max-width: 768px) {
    padding: 1.75rem;
  }
`;
const FileInput = styled.input`
  display: none; /* Masquer l'input natif */
`;

const CustomFileButton = styled.button`
  padding: 0.85rem 2rem; /* Identique à ActionButton */
  background: linear-gradient(90deg, #2e7d32, #4caf50); /* Identique à ActionButton primary */
  color: #ffffff;
  font-size: 0.9rem; /* Identique à ActionButton */
  font-weight: 600;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background: linear-gradient(90deg, #1b5e20, #388e3c); /* Identique à ActionButton:hover primary */
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.65rem 1.5rem;
  }
`;

const ProfileHeader = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: #2e7d32;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.75rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a3c34;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #2e7d32;
  }

  &::after {
    content: '${props => (props.required ? '*' : '')}';
    color: #d32f2f;
    margin-right: 0.25rem;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  right: 0.5rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none;

  @media (max-width: 768px) {
    width: 1rem;
    height: 1rem;
    right: 0.4rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #1a3c34;
  background: ${props => (props.readOnly ? '#f3f4f6' : '#ffffff')};
  cursor: ${props => (props.readOnly ? 'not-allowed' : 'text')};
  transition: all 0.3s ease;
  text-align: right;

  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 8px rgba(46, 125, 50, 0.2);
  }

  ${props =>
    props.error &&
    `
    border-color: #d32f2f;
    background: #fef2f2;
    box-shadow: 0 0 8px rgba(211, 47, 47, 0.2);
  `}

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.6rem 2.5rem 0.6rem 0.6rem;
  }
`;

const LogoPreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
`;

const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #b91c1c;
  margin-top: 0.25rem;
  animation: ${css`${errorFadeIn} 0.3s ease-in-out forwards`};

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.85rem 2rem;
  background: ${props =>
    props.primary ? 'linear-gradient(90deg, #2e7d32, #4caf50)' : '#e0e0e0'};
  color: ${props => (props.primary ? '#ffffff' : '#1a3c34')};
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: ${props =>
      props.primary ? 'linear-gradient(90deg, #1b5e20, #388e3c)' : '#d0d0d0'};
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.65rem 1.5rem;
  }
`;

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avocatId, setAvocatId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    logo: '',
    specialiteJuridique: '',
    nomCabinet: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const response = await fetch('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/avocats/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Fetch profile error: Status ${response.status}, Message: ${errorData.error || 'No error message'}`);
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      setAvocatId(data._id);
      setFormData(prev => ({
        ...prev,
        nom: data.nom || '',
        prenom: data.prenom || '',
        email: data.email || '',
        telephone: data.telephone || '',
        adresse: data.adresse || '',
        ville: data.ville || '',
        logo: data.logo || '',
        specialiteJuridique: data.specialiteJuridique || '',
        nomCabinet: data.nomCabinet || '',
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('خطأ في جلب الملف الشخصي: ' + error.message);
      if (error.message.includes('Invalid token') || error.message.includes('No token provided') || error.message.includes('Avocat not found')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setFormData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
      validateField('logo', file);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'nom':
        newErrors.nom = value.trim() ? '' : 'الاسم مطلوب';
        break;
      case 'prenom':
        newErrors.prenom = value.trim() ? '' : 'اللقب مطلوب';
        break;
      case 'email':
        newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'البريد الإلكتروني غير صالح';
        break;
      case 'telephone':
        newErrors.telephone = /^\+?[1-9]\d{1,14}$/.test(value)
          ? ''
          : 'رقم الهاتف غير صالح';
        break;
      case 'adresse':
        newErrors.adresse = value.trim() ? '' : 'العنوان مطلوب';
        break;
      case 'ville':
        newErrors.ville = value.trim() ? '' : 'المدينة مطلوبة';
        break;
      case 'logo':
        newErrors.logo = value ? '' : 'الصورة مطلوبة';
        break;
      case 'currentPassword':
        newErrors.currentPassword = value.trim() ? '' : 'كلمة المرور الحالية مطلوبة';
        break;
      case 'newPassword':
        newErrors.newPassword = value.length >= 6 ? '' : 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
        break;
      case 'confirmNewPassword':
        newErrors.confirmNewPassword = value === formData.newPassword ? '' : 'تأكيد كلمة المرور غير متطابق';
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'الاسم مطلوب';
    if (!formData.prenom.trim()) newErrors.prenom = 'اللقب مطلوب';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.telephone)) {
      newErrors.telephone = 'رقم الهاتف غير صالح';
    }
    if (!formData.adresse.trim()) newErrors.adresse = 'العنوان مطلوب';
    if (!formData.ville.trim()) newErrors.ville = 'المدينة مطلوبة';
    if (formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword.trim()) newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
      if (formData.newPassword.length < 6) newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
      if (formData.confirmNewPassword !== formData.newPassword) newErrors.confirmNewPassword = 'تأكيد كلمة المرور غير متطابق';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('specialiteJuridique', formData.specialiteJuridique);
      formDataToSend.append('nomCabinet', formData.nomCabinet);
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const profileResponse = await fetch(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/avocats/${avocatId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      if (formData.currentPassword && formData.newPassword) {
        const passwordResponse = await fetch('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/avocats/me/password', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || 'Failed to update password');
        }
      }

      const updatedAvocat = await profileResponse.json();
      setFormData(prev => ({
        ...prev,
        nom: updatedAvocat.nom,
        prenom: updatedAvocat.prenom,
        email: updatedAvocat.email,
        telephone: updatedAvocat.telephone,
        adresse: updatedAvocat.adresse,
        ville: updatedAvocat.ville,
        logo: updatedAvocat.logo,
        specialiteJuridique: updatedAvocat.specialiteJuridique,
        nomCabinet: updatedAvocat.nomCabinet,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      setLogoFile(null);
      toast.success('تم حفظ الملف الشخصي بنجاح');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('خطأ في تحديث الملف الشخصي: ' + error.message);
      if (error.message.includes('Invalid token') || error.message.includes('No token provided') || error.message.includes('Incorrect current password')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <ProfileContainer>
      <NavDash />
      <Sidebar />
      <MainContent>
        <ProfileSection>
          <ProfileHeader>الملف الشخصي</ProfileHeader>
          <FormGroup>
            <Label required>الاسم</Label>
            <InputWrapper>
              <Input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.nom}
              />
              <InputIcon>
                <FaUser />
              </InputIcon>
            </InputWrapper>
            {errors.nom && <ErrorMessage>{errors.nom}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label required>اللقب</Label>
            <InputWrapper>
              <Input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.prenom}
              />
              <InputIcon>
                <FaUser />
              </InputIcon>
            </InputWrapper>
            {errors.prenom && <ErrorMessage>{errors.prenom}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label required>البريد الإلكتروني</Label>
            <InputWrapper>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.email}
              />
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
            </InputWrapper>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label required>رقم الهاتف</Label>
            <InputWrapper>
              <Input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.telephone}
              />
              <InputIcon>
                <FaPhone />
              </InputIcon>
            </InputWrapper>
            {errors.telephone && <ErrorMessage>{errors.telephone}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label required>العنوان</Label>
            <InputWrapper>
              <Input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.adresse}
              />
              <InputIcon>
                <FaMapMarkerAlt />
              </InputIcon>
            </InputWrapper>
            {errors.adresse && <ErrorMessage>{errors.adresse}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label required>المدينة</Label>
            <InputWrapper>
              <Input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.ville}
              />
              <InputIcon>
                <FaCity />
              </InputIcon>
            </InputWrapper>
            {errors.ville && <ErrorMessage>{errors.ville}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label>شعار المحامي</Label>
            <InputWrapper>
              <FileInput
                type="file"
                id="logoInput"
                name="logo"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={!isEditing}
              />
              <CustomFileButton
                type="button"
                onClick={() => document.getElementById('logoInput').click()}
                disabled={!isEditing}
              >
                <FaPaperclip /> اختر الملف
              </CustomFileButton>
            </InputWrapper>
            {formData.logo && <LogoPreview src={formData.logo} alt="Logo" />}
            {errors.logo && <ErrorMessage>{errors.logo}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label>التخصص القانوني</Label>
            <InputWrapper>
              <Input
                type="text"
                name="specialiteJuridique"
                value={formData.specialiteJuridique}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.specialiteJuridique}
              />
              <InputIcon>
                <FaGavel />
              </InputIcon>
            </InputWrapper>
            {errors.specialiteJuridique && <ErrorMessage>{errors.specialiteJuridique}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label>اسم المكتب</Label>
            <InputWrapper>
              <Input
                type="text"
                name="nomCabinet"
                value={formData.nomCabinet}
                onChange={handleInputChange}
                readOnly={!isEditing}
                error={!!errors.nomCabinet}
              />
              <InputIcon>
                <FaBuilding />
              </InputIcon>
            </InputWrapper>
            {errors.nomCabinet && <ErrorMessage>{errors.nomCabinet}</ErrorMessage>}
          </FormGroup>
          {isEditing && (
            <>
              <FormGroup>
                <Label required>كلمة المرور الحالية</Label>
                <InputWrapper>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    error={!!errors.currentPassword}
                  />
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                </InputWrapper>
                {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>كلمة المرور الجديدة</Label>
                <InputWrapper>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    error={!!errors.newPassword}
                  />
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                </InputWrapper>
                {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
              </FormGroup>
              <FormGroup>
                <Label>تأكيد كلمة المرور الجديدة</Label>
                <InputWrapper>
                  <Input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    error={!!errors.confirmNewPassword}
                  />
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                </InputWrapper>
                {errors.confirmNewPassword && <ErrorMessage>{errors.confirmNewPassword}</ErrorMessage>}
              </FormGroup>
            </>
          )}
          <ButtonGroup>
            {isEditing ? (
              <ActionButton primary onClick={handleSave}>
                <FaSave /> حفظ
              </ActionButton>
            ) : (
              <ActionButton primary onClick={handleEdit}>
                <FaEdit /> تعديل
              </ActionButton>
            )}
          </ButtonGroup>
        </ProfileSection>
      </MainContent>
    </ProfileContainer>
  );
}

export default Profile;