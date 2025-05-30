import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AdminLayout from './AdminLayout';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding: 2rem;
  direction: rtl;
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #2e7d32;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
`;

const FormContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #ffffff;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(to right, #4ade80, #2e7d32);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const fetchAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(prev => ({ ...prev, email: response.data.data.email }));
    } catch (error) {
      toast.error('خطأ في جلب بيانات الإداري: ' + (error.response?.data?.message || 'خطأ غير معروف'));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [navigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const data = { email: formData.email };
      if (formData.password) {
        data.password = formData.password;
      }
      await axios.put('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/me', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم تحديث الإعدادات بنجاح');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      toast.error('خطأ: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>الإعدادات</Title>
        </Header>
        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <InputWrapper>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </InputWrapper>
            <InputWrapper>
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="أدخل تأكيد كلمة المرور"
              />
            </InputWrapper>
            <Button type="submit">تحديث</Button>
          </Form>
        </FormContainer>
      </Container>
    </AdminLayout>
  );
}

export default Settings;