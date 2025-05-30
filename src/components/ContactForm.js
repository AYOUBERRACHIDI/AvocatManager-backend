import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled, { keyframes, css } from 'styled-components';

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

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
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

const Section = styled.section`
  padding: 6rem 1.5rem;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f8fafc;
    z-index: 0;
  }

  @media (min-width: 768px) {
    padding: 8rem 4rem;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  animation: ${fadeIn} 1s ease-in-out forwards;
  position: relative;
  z-index: 1;

  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, #2e7d32, #facc15);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  }

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Container = styled.div`
  max-width: 40rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Form = styled.form`
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeInUp} 0.8s ease-in-out forwards;

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const FormText = styled.p`
  margin-bottom: 2rem;
  color: #4b5563;
  font-size: 1.125rem;
  font-weight: 400;
  text-align: center;
  animation: ${fadeInUp} 1s ease-in-out forwards;
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 1.2s ease-in-out forwards;
`;

const Label = styled.label`
  display: block;
  color: #4b5563;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease-in-out;
  background: rgba(255, 255, 255, 0.5);

  &:focus {
    outline: none;
    border: 1px solid transparent;
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.3);
    background: rgba(255, 255, 255, 0.8);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  height: 12rem;
  font-size: 1rem;
  resize: none;
  transition: all 0.3s ease-in-out;
  background: rgba(255, 255, 255, 0.5);

  &:focus {
    outline: none;
    border: 1px solid transparent;
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.3);
    background: rgba(255, 255, 255, 0.8);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(to right, #2e7d32, #1a4d1e);
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 1.4s ease-in-out forwards;

  &:hover {
    background: linear-gradient(to right, #1a4d1e, #2e7d32);
    box-shadow: 0 0 20px rgba(46, 125, 50, 0.7);
    transform: translateY(-2px);
  }

  &:active {
    animation: ${pulse} 0.5s ease-in-out;
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

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/messages', formData);
      toast.success('تم إرسال الرسالة بنجاح!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('خطأ في إرسال الرسالة: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  return (
    <Section>
      <Title>تواصل معنا</Title>
      <Container>
        <Form onSubmit={handleSubmit}>
          <FormText>هل لديك أسئلة؟ نحن هنا للمساعدة!</FormText>
          <FormGroup>
            <Label htmlFor="name">الاسم</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="أدخل اسمك"
              value={formData.name}
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
            <Label htmlFor="message">الرسالة</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="اكتب رسالتك هنا"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <Button type="submit">
            <span />
            إرسال
          </Button>
        </Form>
      </Container>
    </Section>
  );
}

export default ContactForm;