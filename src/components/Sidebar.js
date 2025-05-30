import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, DocumentTextIcon, UserIcon, ChartBarIcon, CalendarIcon, ArrowRightOnRectangleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { FaClock } from 'react-icons/fa';
import { UserPlusIcon, MenuIcon, XIcon } from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';
import logo from '../assets/logo1.jpeg';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;


const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
  }
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 60px;
  bottom: 0;
  right: 0;
  height: calc(100vh - 60px);
  width: 70px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: ${css`${fadeIn} 0.8s ease-in-out forwards`};
  transition: width 0.3s ease, transform 0.3s ease;

  @media (max-width: 768px) {
    width: ${props => (props.isOpen ? '200px' : '0')};
    transform: ${props => (props.isOpen ? 'translateX(0)' : 'translateX(100%)')};
    background: rgba(255, 255, 255, 0.95);
    padding: ${props => (props.isOpen ? '1.5rem 1rem' : '0')};
    animation: ${props => (props.isOpen ? css`${slideIn} 0.3s ease-in-out` : css`${slideOut} 0.3s ease-in-out`)};
    overflow: hidden;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  @media (min-width: 769px) {
    display: none;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  background: none;
  border: none;
  color: #2e7d32;
  padding: 0.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }

  & > svg {
    width: 24px;
    height: 24px;
  }
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 2rem;
  border: 2px solid #2e7d32;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.3);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    display: ${props => (props.isOpen ? 'block' : 'none')};
  }
`;

const NavLink = styled(Link)`
  position: relative;
  padding: 0.5rem;
  color: ${props => (props.isActive ? '#2e7d32' : '#6b7280')};
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;

  &:hover {
    color: #facc15;
    transform: scale(1.2);
  }

  ${props =>
    props.isActive &&
    css`
      animation: ${pulse} 2s infinite;
      background: rgba(46, 125, 50, 0.1);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
    `}

  & > svg {
    width: 24px;
    height: 24px;
  }

  &:hover > div {
    visibility: visible;
    opacity: 1;
    transform: translateX(-10px);
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin: 0.25rem 0;

    ${props =>
      props.isActive &&
      css`
        background: rgba(46, 125, 50, 0.2);
        border-radius: 8px;
      `}

    &:hover {
      transform: none;
      background: rgba(46, 125, 50, 0.1);
    }

    & > svg {
      margin-left: 0.5rem;
    }
  }
`;

const NavLabel = styled.span`
  display: none;
  font-size: 0.9rem;
  font-weight: 500;

  @media (max-width: 768px) {
    display: inline;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%) translateX(0);
  background: rgba(46, 125, 50, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease-in-out;
  z-index: 1000;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutLink = styled(NavLink)`
  margin-top: auto;
`;

function Sidebar({ setToken }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = path => location.pathname === path;

  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('token');
    if (typeof setToken === 'function') {
      setToken('');
    }
    navigate('/login');
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <HamburgerButton onClick={toggleSidebar} aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>
        {isOpen ? <XIcon color="white"/> : <MenuIcon />}
      </HamburgerButton>
      <Overlay isOpen={isOpen} onClick={toggleSidebar} />
      <SidebarContainer dir="rtl" isOpen={isOpen}>
        <Logo src={logo} alt="Logo" isOpen={isOpen} />
        <NavLink to="/dashboard" isActive={isActive('/dashboard')} onClick={() => setIsOpen(false)}>
          <HomeIcon />
          <NavLabel>الرئيسية</NavLabel>
          <Tooltip>الرئيسية</Tooltip>
        </NavLink>
        <NavLink to="/legal-case-management" isActive={isActive('/legal-case-management')} onClick={() => setIsOpen(false)}>
          <DocumentTextIcon />
          <NavLabel>إدارة الملفات</NavLabel>
          <Tooltip>إدارة الملفات</Tooltip>
        </NavLink>
        <NavLink to="/client-management" isActive={isActive('/client-management')} onClick={() => setIsOpen(false)}>
          <UserIcon />
          <NavLabel>إدارة الموكلين</NavLabel>
          <Tooltip>إدارة الموكلين</Tooltip>
        </NavLink>
        <NavLink to="/payment-management" isActive={isActive('/payment-management')} onClick={() => setIsOpen(false)}>
          <ChartBarIcon />
          <NavLabel>إدارة المدفوعات</NavLabel>
          <Tooltip>إدارة المدفوعات</Tooltip>
        </NavLink>
        <NavLink to="/calendar" isActive={isActive('/calendar')} onClick={() => setIsOpen(false)}>
          <CalendarIcon />
          <NavLabel>التقويم</NavLabel>
          <Tooltip>التقويم</Tooltip>
        </NavLink>
        <NavLink to="/sessions" isActive={isActive('/sessions')} onClick={() => setIsOpen(false)}>
          <FaClock />
          <NavLabel>إدارة الجلسات</NavLabel>
          <Tooltip>إدارة الجلسات</Tooltip>
        </NavLink>
        <NavLink to="/secretary-management" isActive={isActive('/secretary-management')} onClick={() => setIsOpen(false)}>
          <UserPlusIcon />
          <NavLabel>إدارة السكرتارية</NavLabel>
          <Tooltip>إدارة السكرتارية</Tooltip>
        </NavLink>
        <NavLink to="/case-archives" isActive={isActive('/case-archives')} onClick={() => setIsOpen(false)}>
          <ArchiveBoxIcon />
          <NavLabel>أرشيف الملفات</NavLabel>
          <Tooltip>أرشيف الملفات</Tooltip>
        </NavLink>
        <LogoutLink to="/" onClick={handleLogout} isActive={false}>
          <ArrowRightOnRectangleIcon />
          <NavLabel>تسجيل الخروج</NavLabel>
          <Tooltip>تسجيل الخروج</Tooltip>
        </LogoutLink>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;