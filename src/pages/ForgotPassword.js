import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
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
  background: #f8fafc;
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
  color: #dc2626;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  background: rgba(220, 38, 38, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const TimerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(46, 125, 50, 0.05);
  border: 2px solid ${props => (props.expired ? '#dc2626' : '#2e7d32')};
  border-radius: 0.75rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const TimerText = styled.p`
  color: ${props => (props.expired ? '#dc2626' : '#2e7d32')};
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const OtpContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const Label = styled.label`
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
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

const OtpInput = styled(Input)`
  width: 2.5rem;
  height: 2.5rem;
  text-align: center;
  font-size: 1.25rem;
  padding: 0;

  @media (min-width: 768px) {
    width: 2.75rem;
    height: 2.75rem;
    font-size: 1.35rem;
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
  margin-top: 0.5rem;

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

  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResendButton = styled(Button)`
  background: linear-gradient(to right, #6b7280, #4b5563);
  margin-top: 1.25rem;

  &:hover {
    background: linear-gradient(to right, #4b5563, #6b7280);
  }
`;

const LinkWrapper = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const StyledLink = styled(Link)`
  color: #2e7d32;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #facc15;
    text-decoration: underline;
  }
`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(600); 
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    let cooldownTimer;
    if (resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  useEffect(() => {
    let validityTimer;
    if (step === 2 && timer > 0) {
      validityTimer = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(validityTimer);
  }, [step, timer]);

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; 
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/auth/forgot-password',
        { email }
      );
      toast.success(response.data.message);
      setStep(2);
      setTimer(600); 
      setOtpDigits(['', '', '', '', '', '']); 
      setResendCooldown(30); 
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال رمز التحقق');
      toast.error(err.response?.data?.message || 'فشل إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || timer <= 0) return;
    setIsLoading(true);
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('يرجى إدخال رمز تحقق مكون من 6 أرقام');
      setIsLoading(false);
      return;
    }
    try {
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التحقق من رمز التحقق');
      toast.error(err.response?.data?.message || 'فشل التحقق من رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    if (isLoading || resendCooldown > 0) return;
    await handleEmailSubmit(e); 
  };

  return (
    <Container>
      <Navbar />
      <Section>
        <FormContainer>
          <Title>نسيت كلمة المرور</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {step === 1 ? (
            <Form onSubmit={handleEmailSubmit}>
              <FormGroup>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FormGroup>
              <Button type="submit" disabled={isLoading}>
                <span />
                {isLoading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </Form>
          ) : (
            <>
              <Form onSubmit={handleOtpSubmit}>
                <TimerContainer expired={timer <= 0}>
                  <TimerText expired={timer <= 0}>
                    {timer > 0
                      ? `الوقت المتبقي: ${formatTimer(timer)}`
                      : 'انتهت صلاحية الرمز'}
                  </TimerText>
                </TimerContainer>
                <FormGroup>
                  <Label>رمز التحقق</Label>
                  <OtpContainer>
                    {otpDigits.map((digit, index) => (
                      <OtpInput
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        disabled={isLoading || timer <= 0}
                      />
                    ))}
                  </OtpContainer>
                </FormGroup>
                <Button type="submit" disabled={isLoading || timer <= 0}>
                  <span />
                  {isLoading ? 'جارٍ التحقق...' : 'التحقق'}
                </Button>
              </Form>
              <ResendButton
                onClick={handleResendOtp}
                disabled={isLoading || resendCooldown > 0}
              >
                <span />
                {resendCooldown > 0
                  ? `إعادة إرسال بعد ${resendCooldown} ث`
                  : isLoading
                  ? 'جارٍ الإرسال...'
                  : 'إعادة إرسال رمز التحقق'}
              </ResendButton>
            </>
          )}
          <LinkWrapper>
            العودة إلى{' '}
            <StyledLink to="/login">تسجيل الدخول</StyledLink>
          </LinkWrapper>
        </FormContainer>
      </Section>
      <Footer />
    </Container>
  );
}

export default ForgotPassword;