import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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

const ring = keyframes`
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(15deg);
  }
  20% {
    transform: rotate(-15deg);
  }
  30% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

const NavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: linear-gradient(to left, #2e7d32, #4ade80);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3rem;
  margin-right: 70px; /* Shift left to avoid overlapping Sidebar */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  direction: rtl;
  animation: ${css`${fadeIn} 0.6s ease-in-out forwards`};

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    height: 60px;
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
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
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

const UserDetails = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

function NavDash() {
  const [userData, setUserData] = useState({
    name: 'جارٍ التحميل...',
    logo: '',
    specialiteJuridique: '',
    nomCabinet: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserData({ name: 'غير معروف', logo: '', specialiteJuridique: '', nomCabinet: '' });
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
          console.error(`Fetch error: Status ${response.status}, Message: ${errorData.error || 'No error message'}`);
          throw new Error(errorData.error || 'Failed to fetch user');
        }

        const data = await response.json();
        setUserData({
          name: `${data.nom} ${data.prenom}`,
          logo: data.logo || '',
          specialiteJuridique: data.specialiteJuridique || '',
          nomCabinet: data.nomCabinet || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({ name: 'غير معروف', logo: '', specialiteJuridique: '', nomCabinet: '' });
        toast.error('خطأ في جلب بيانات المستخدم: ' + error.message);
        if (error.message.includes('Invalid token') || error.message.includes('No token provided') || error.message.includes('Avocat not found')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <NavbarContainer>
      <NavbarTitle>لوحة التحكم</NavbarTitle>
      <NavbarActions>
        <NotificationIcon>
          <BellIcon />
        </NotificationIcon>
        <UserProfile onClick={handleProfileClick}>
          {userData.logo && <UserLogo src={userData.logo} alt="User Logo" />}
          <UserInfo>
            <UserName>{userData.name}</UserName>
            {(userData.specialiteJuridique || userData.nomCabinet) && (
              <UserDetails>
                {userData.specialiteJuridique} {userData.nomCabinet && `| ${userData.nomCabinet}`}
              </UserDetails>
            )}
          </UserInfo>
        </UserProfile>
      </NavbarActions>
    </NavbarContainer>
  );
}

export default NavDash;