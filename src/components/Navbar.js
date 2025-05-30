import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import styled, { keyframes } from 'styled-components';
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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const stagger = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const twinkle = keyframes`
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
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

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.5);
  }
`;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  z-index: 1000;
  transition: background 0.3s ease-in-out;

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
  }

  @media (min-width: 768px) {
    padding: 1rem 3rem;
  }
`;

const ParticleContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const Particle = styled.div`
  position: absolute;
  background: #2e7d32;
  border-radius: 50%;
  animation: ${twinkle} 3s ease-in-out infinite;

  &:nth-child(1) {
    top: 5rem;
    right: 1.25rem;
    width: 0.5rem;
    height: 0.5rem;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    top: 7.5rem;
    left: 2.5rem;
    width: 0.75rem;
    height: 0.75rem;
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    bottom: 5rem;
    right: 33.33%;
    width: 0.5rem;
    height: 0.5rem;
    animation-delay: 1s;
  }
`;

const NavContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${scaleIn} 1s ease-in-out forwards;
`;

const LogoImage = styled.img`
  width: 3rem;
  height: 3rem;
  background: transparent;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
`;

const HamburgerButton = styled.button`
  color: #2e7d32;
  outline: none;
  transition: transform 0.3s ease-in-out;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover {
    transform: scale(1.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const HamburgerIcon = styled.div`
  width: 2rem;
  height: 2rem;
`;

const NavLinks = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: absolute;
  top: 4rem;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(to right, #2e7d32, #facc15, #2e7d32) 1;
  padding: 1rem;
  z-index: 10;
  transition: all 0.5s ease-in-out;
  transform: ${props => (props.isOpen ? 'translateY(0)' : 'translateY(-20px)')};
  opacity: ${props => (props.isOpen ? '1' : '0')};

  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    position: static;
    width: auto;
    gap: 2rem;
    background: transparent;
    border: none;
    padding: 0;
    transform: translateY(0);
    opacity: 1;
  }
`;

const NavLink = styled(Link)`
  position: relative;
  font-size: 1rem;
  font-weight: 500;
  color: #2e7d32;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.3s ease-in-out;
  animation: ${stagger} 0.5s ease-in-out forwards;
  animation-delay: ${props => props.index * 0.1}s;

  &:hover {
    color: #facc15;
  }

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    right: 0;
    background: linear-gradient(to right, #2e7d32, #facc15);
    transition: width 0.3s ease-in-out;
  }

  &:hover:after {
    width: 100%;
  }

  @media (min-width: 768px) {
    padding: 0;
  }
`;

const AuthButtons = styled.div`
  display: none;
  align-items: center;
  gap: 1rem;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    display: none;
  }
`;

const AuthButton = styled.button`
  position: relative;
  padding: 0.5rem 1rem;
  background: ${props => (props.logout ? 'linear-gradient(to right, #dc2626, #991b1b)' : 'linear-gradient(to right, #2e7d32, #1a4d1e)')};
  color: #ffffff;
  font-weight: 600;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;
  animation: ${stagger} 0.5s ease-in-out forwards;
  animation-delay: ${props => props.delay}s;
  overflow: hidden;

  &:hover {
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

const AuthLink = styled(Link)`
  color: #2e7d32;
  text-decoration: none;
  transition: color 0.3s ease-in-out;
  animation: ${stagger} 0.5s ease-in-out forwards;
  animation-delay: ${props => props.delay}s;

  &:hover {
    color: #facc15;
  }

  &.mobile {
    text-align: center;
    padding: 0.5rem 0;
  }
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
    alert('تم تسجيل الخروج بنجاح!');
  };

  const handleNavClick = (sectionId) => {
    setIsOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: 'home' } });
      }
    } else {
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: sectionId } });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const timeout = setTimeout(() => {
        if (location.state.scrollTo === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(location.state.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [location]);

  return (
    <Nav className={isScrolled ? 'scrolled' : ''}>
      {isOpen && (
        <ParticleContainer>
          <Particle />
          <Particle />
          <Particle />
        </ParticleContainer>
      )}
      <NavContainer>
        <LogoContainer>
          <LogoImage src={logo} alt="Logo" />
          <LogoText>Qadiyatuk</LogoText>
        </LogoContainer>

        <HamburgerButton onClick={toggleMenu}>
          <HamburgerIcon as={isOpen ? XMarkIcon : Bars3Icon} />
        </HamburgerButton>

        <NavLinks isOpen={isOpen}>
          {[
            { label: 'الرئيسية', sectionId: 'home' },
            { label: 'من نحن', sectionId: 'about' },
            { label: 'الميزات', sectionId: 'features' },
            { label: 'اتصل بنا', sectionId: 'contact' },
          ].map((link, index) => (
            <NavLink
              key={link.label}
              to="/"
              index={index}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.sectionId);
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </NavLinks>

        <AuthButtons>
          {isAuthenticated ? (
            <AuthButton logout onClick={handleLogout} delay={0}>
              <span />
              تسجيل الخروج
            </AuthButton>
          ) : (
            <>
              <AuthLink to="/login" delay={0.2}>
                تسجيل الدخول
              </AuthLink>
              <AuthButton as={Link} to="/register" delay={0.4} onClick={() => setIsOpen(false)}>
                <span />
                التسجيل
              </AuthButton>
            </>
          )}
        </AuthButtons>

        {isOpen && (
          <MobileAuthButtons>
            {isAuthenticated ? (
              <AuthButton logout onClick={handleLogout} delay={0}>
                <span />
                تسجيل الخروج
              </AuthButton>
            ) : (
              <>
                <AuthLink to="/login" className="mobile" onClick={() => setIsOpen(false)}>
                  تسجيل الدخول
                </AuthLink>
                <AuthButton as={Link} to="/register" delay={0.2} onClick={() => setIsOpen(false)}>
                  <span />
                  التسجيل
                </AuthButton>
              </>
            )}
          </MobileAuthButtons>
        )}
      </NavContainer>
    </Nav>
  );
}

export default Navbar;