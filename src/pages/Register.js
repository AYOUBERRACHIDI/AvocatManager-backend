import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
    margin-top: 100px;

`;

const Section = styled.section`
  flex: 1;
  padding: 3rem 1rem;
  background: #f8fafc; /* Slightly off-white background */
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    padding: 4rem 4rem;
  }
`;

const FormContainer = styled.div`
  max-width: 28rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeInUp} 0.8s ease-in-out forwards;

  @media (min-width: 768px) {
    padding: 2.5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  animation: ${fadeIn} 1s ease-in-out forwards;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const ErrorMessage = styled.p`
  color: #dc2626; /* Red for error */
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1rem;
  background: rgba(220, 38, 38, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #6b7280; /* Gray for label */
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: transparent;
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
    box-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #2e7d32, #1a4d1e);
  color: #ffffff;
  font-weight: 600;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(to right, #1a4d1e, #2e7d32);
    box-shadow: 0 0 15px #facc15;
    transform: scale(1.05);
  }

  & > span {
    position: absolute;
    inset: 0;
    background: #facc15;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    animation: ${ripple} 1s ease-in-out;
  }

  &:hover > span {
    opacity: 0.3;
  }
`;

const LinkWrapper = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: #6b7280; /* Gray for text */
  font-size: 1rem;
`;

const StyledLink = styled(Link)`
  color: #2e7d32; /* qadiyatuk-green */
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #facc15; /* Yellow on hover */
    text-decoration: underline;
  }
`;

function Register({ setToken }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    ville: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/auth/register', 
        formData
      );
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      alert('تم التسجيل بنجاح!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التسجيل');
    }
  };

  return (
    <Container>
      <Navbar />
      <Section>
        <FormContainer>
          <Title>التسجيل</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="nom">الاسم</Label>
              <Input
                type="text"
                id="nom"
                name="nom"
                placeholder="أدخل اسمك"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="prenom">اللقب</Label>
              <Input
                type="text"
                id="prenom"
                name="prenom"
                placeholder="أدخل لقبك"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="telephone">الهاتف</Label>
              <Input
                type="text"
                id="telephone"
                name="telephone"
                placeholder="أدخل رقم هاتفك"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="adresse">العنوان</Label>
              <Input
                type="text"
                id="adresse"
                name="adresse"
                placeholder="أدخل عنوانك"
                value={formData.adresse}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="ville">المدينة</Label>
              <Input
                type="text"
                id="ville"
                name="ville"
                placeholder="أدخل المدينة"
                value={formData.ville}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <Button type="submit">
              <span />
              التسجيل
            </Button>
          </Form>
          <LinkWrapper>
            لديك حساب بالفعل؟{' '}
            <StyledLink to="/login">تسجيل الدخول</StyledLink>
          </LinkWrapper>
        </FormContainer>
      </Section>
      <Footer />
    </Container>
  );
}

export default Register;