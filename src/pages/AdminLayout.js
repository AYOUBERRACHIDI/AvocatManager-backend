import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { HomeIcon, ArrowRightOnRectangleIcon, BellIcon, Cog6ToothIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon, UsersIcon, MenuIcon, XIcon } from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';
import logo from '../assets/logo1.jpeg';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInSidebar = keyframes`
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

const ring = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(15deg); }
  40% { transform: rotate(-15deg); }
  50% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
`;

const NavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 70px;
  height: 70px;
  background: linear-gradient(to left, #2e7d32, #4ade80);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  direction: rtl;
  animation: ${css`${fadeIn} 0.6s ease-in-out forwards`};

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    height: 60px;
    right: 0;
  }
`;

const NavbarTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const NavbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }

  & > svg {
    width: 24px;
    height: 24px;
  }
`;

const NotificationIcon = styled.div`
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.15);
    animation: ${css`${ring} 0.8s ease-in-out`};
  }

  & > svg {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 768px) {
    & > svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const UserLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 70px;
  bottom: 0;
  right: 0;
  height: calc(100vh - 70px);
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
  animation: ${css`${fadeInSidebar} 0.8s ease-in-out forwards`};
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

const SidebarTooltip = styled.div`
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

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  margin-right: 70px;
  margin-top: 70px;
  direction: rtl;

  @media (max-width: 768px) {
    margin-right: 0;
    padding: 1.5rem;
    margin-top: 60px;
  }
`;

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({
    name: 'جارٍ التحميل...',
    logo: '',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = path => location.pathname === path;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          name: "إداري",
          logo: response.data.logo ? `http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/${response.data.logo}` : '',
        });
      } catch (err) {
        setUserData({ name: 'إداري', logo: '' });
        toast.error('خطأ في جلب بيانات المستخدم: ' + (err.response?.data?.message || 'خطأ غير معروف'));
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <Container>
      <NavbarContainer>
        <HamburgerButton onClick={toggleSidebar} aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>
            {isSidebarOpen ? <XIcon /> : <MenuIcon />}
          </HamburgerButton>
        <NavbarTitle>لوحة تحكم الإدارة</NavbarTitle>
        <NavbarActions>
          
          <NotificationIcon onClick={() => toast.info('لا توجد إشعارات جديدة')}>
            <BellIcon />
          </NotificationIcon>
          <UserProfile>
            {userData.logo ? <UserLogo src={userData.logo} alt="User Logo" /> : null}
            <UserInfo>
              <UserName>{userData.name}</UserName>
            </UserInfo>
          </UserProfile>
        </NavbarActions>
      </NavbarContainer>
      <Overlay isOpen={isSidebarOpen} onClick={toggleSidebar} />
      <SidebarContainer dir="rtl" isOpen={isSidebarOpen}>
        <Logo src={logo} alt="Logo" isOpen={isSidebarOpen} />
        <NavLink to="/admin-dashboard" isActive={isActive('/admin-dashboard')} onClick={() => setIsSidebarOpen(false)}>
          <HomeIcon />
          <NavLabel>الرئيسية</NavLabel>
          <SidebarTooltip>الرئيسية</SidebarTooltip>
        </NavLink>
        <NavLink to="/admin-avocats" isActive={isActive('/admin-avocats')} onClick={() => setIsSidebarOpen(false)}>
          <UserPlusIcon />
          <NavLabel>إدارة المحامين</NavLabel>
          <SidebarTooltip>إدارة المحامين</SidebarTooltip>
        </NavLink>
        <NavLink to="/admin-secretaires" isActive={isActive('/admin-secretaires')} onClick={() => setIsSidebarOpen(false)}>
          <UsersIcon />
          <NavLabel>إدارة السكرتيرات</NavLabel>
          <SidebarTooltip>إدارة السكرتيرات</SidebarTooltip>
        </NavLink>
        <NavLink to="/admin-messages" isActive={isActive('/admin-messages')} onClick={() => setIsSidebarOpen(false)}>
          <EnvelopeIcon />
          <NavLabel>إدارة الرسائل</NavLabel>
          <SidebarTooltip>إدارة الرسائل</SidebarTooltip>
        </NavLink>
        <NavLink to="/settings" isActive={isActive('/settings')} onClick={() => setIsSidebarOpen(false)}>
          <Cog6ToothIcon />
          <NavLabel>الإعدادات</NavLabel>
          <SidebarTooltip>الإعدادات</SidebarTooltip>
        </NavLink>
        <LogoutLink to="/" onClick={handleLogout} isActive={false}>
          <ArrowRightOnRectangleIcon />
          <NavLabel>تسجيل الخروج</NavLabel>
          <SidebarTooltip>تسجيل الخروج</SidebarTooltip>
        </LogoutLink>
      </SidebarContainer>
      <Content>{children}</Content>
    </Container>
  );
}

export default AdminLayout;