import React from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import styled, { keyframes, css } from 'styled-components';
import logo from '../assets/logo1.jpeg';

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

const FooterSection = styled.footer`
  padding: 2rem 1rem 1rem; /* Reduced padding */
  background: #ffffff;
  position: relative;
  overflow: hidden;
  direction: rtl;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 20%, rgba(0, 0, 0, 0.05), transparent 70%);
    z-index: 0;
  }

  @media (min-width: 768px) {
    padding: 2.5rem 4rem 1.5rem;
  }
`;

const Container = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Reduced gap */
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 3rem; /* Reduced gap */
  }
`;

const LogoSection = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 1s ease-in-out forwards;

  @media (min-width: 768px) {
    width: 33.333%;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.75rem; /* Reduced margin */
`;

const LogoImage = styled.img`
  width: 3rem; /* Reduced size */
  height: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  border: 2px solid #2e7d32;
  margin-bottom: 0.5rem; /* Reduced margin */
`;

const LogoText = styled.span`
  font-size: 1.5rem; /* Reduced font size */
  font-weight: 800;
  text-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  background: linear-gradient(to right, #2e7d32, #4ade80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 1rem; /* Reduced font size */
  line-height: 1.5; /* Reduced line height */
  max-width: 20rem; /* Reduced max-width */
  margin: 0 auto;
`;

const StartButton = styled.button`
  margin-top: 1rem; /* Reduced margin */
  padding: 0.5rem 1.5rem; /* Reduced padding */
  background: linear-gradient(to right, #2e7d32, #1a4d1e);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem; /* Reduced font size */
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(to right, #1a4d1e, #2e7d32);
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.7);
    transform: translateY(-2px);
  }

  &:active {
    animation: ${pulse} 0.5s ease-in-out;
  }

  @media (min-width: 768px) {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
`;

const LinksSection = styled.div`
  color: #4b5563;
  font-size: 0.875rem; /* Reduced font size */
  animation: ${fadeIn} 1s ease-in-out forwards 0.2s;
`;

const SectionTitle = styled.h4`
  font-size: 1.25rem; /* Reduced font size */
  font-weight: 700;
  color: #1a2525;
  margin-bottom: 1rem; /* Reduced margin */
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.25rem;
    right: 0;
    width: 2.5rem;
    height: 2px; /* Reduced height */
    background: linear-gradient(to right, #2e7d32, #facc15);
    border-radius: 2px;
  }
`;

const LinksList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Reduced gap */
`;

const LinkItem = styled.li`
  a {
    color: #4b5563;
    transition: color 0.3s ease-in-out;

    &:hover {
      color: #2e7d32;
    }
  }
`;

const SocialSection = styled.div`
  color: #4b5563;
  font-size: 0.875rem; /* Reduced font size */
  animation: ${fadeIn} 1s ease-in-out forwards 0.4s;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem; /* Reduced gap */
  justify-content: flex-end;
`;

const SocialLink = styled.a`
  color: #4b5563;
  transition: all 0.3s ease-in-out;
  font-size: 1.25rem; /* Reduced size */

  &:hover {
    color: #2e7d32;
    transform: scale(1.2);
  }
`;

const CopyrightSection = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem; /* Reduced margin */
  padding-top: 1rem; /* Reduced padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem; /* Reduced gap */
  color: #6b7280;
  font-size: 0.75rem; /* Reduced font size */

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const CopyrightText = styled.span`
  .highlight {
    font-weight: 600;
    color: #2e7d32;
  }
`;

const ScrollTopButton = styled.button`
  padding: 0.4rem; /* Reduced padding */
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #2e7d32;
    border-color: #facc15;
    box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  }

  svg {
    width: 1rem; /* Reduced size */
    height: 1rem;
    color: #1a2525;
  }

  &:hover svg {
    color: #ffffff;
  }
`;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterSection>
      <Container>
        {/* Logo + Text + Button Section */}
        <LogoSection>
          <LogoWrapper>
            <LogoImage src={logo} alt="شعار" />
            <LogoText>قضيتك</LogoText>
          </LogoWrapper>
          <Description>
            إدارة القضايا، الفواتير، المواعيد، والعملاء. كل ذلك في منصة آمنة واحدة.
          </Description>
          <StartButton>ابدأ الآن</StartButton>
        </LogoSection>

        {/* Quick Links */}
        <LinksSection>
          <SectionTitle>روابط</SectionTitle>
          <LinksList>
            <LinkItem><a href="/">الميزات</a></LinkItem>
            <LinkItem><a href="/about">من نحن</a></LinkItem>
            <LinkItem><a href="/contact">اتصل بنا</a></LinkItem>
          </LinksList>
        </LinksSection>

        {/* Social Media */}
        <SocialSection>
          <SectionTitle>تابعنا على</SectionTitle>
          <SocialIcons>
            <SocialLink href="#"><FaTwitter /></SocialLink>
            <SocialLink href="#"><FaFacebookF /></SocialLink>
            <SocialLink href="#"><FaLinkedinIn /></SocialLink>
          </SocialIcons>
        </SocialSection>
      </Container>

      {/* Copyright & Scroll Top */}
      <CopyrightSection>
        <CopyrightText>
          © {currentYear} <span className="highlight">قضيتك</span>. جميع الحقوق محفوظة.
        </CopyrightText>
        <ScrollTopButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUpIcon />
        </ScrollTopButton>
      </CopyrightSection>
    </FooterSection>
  );
}

export default Footer;