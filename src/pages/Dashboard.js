import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaUserPlus, FaFileAlt, FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ar';

moment.locale('ar', {
  preformat: (string) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return string.replace(/[0-9]/g, (match) => arabicNumerals[parseInt(match)]);
  },
  postformat: (string) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return string.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (match) => arabicNumerals.indexOf(match).toString());
  },
});

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

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #e9edf2 0%, #f5f7fa 100%);
  direction: rtl;
// font-family: 'Amiri', 'Noto Sans Arabic', sans-serif; /* Police cohérente */`;

const MainContent = styled.div`
  flex: 1;
  margin-right: 70px;
  margin-top: 60px;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-right: 0;
  }
`;

const StatCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCardWrapper = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 0.5rem;
`;

const StatPercentage = styled.div`
  font-size: 0.9rem;
  color: ${props => (props.isPositive ? '#2e7d32' : '#ef4444')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const QuickActionsSection = styled.div`
  margin-bottom: 2rem;
`;

const QuickActionsGrid = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButtonStyled = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: linear-gradient(to right, #2e7d32, #1a4d1e);
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 12px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(to right, #1a4d1e, #2e7d32);
    box-shadow: 0 0 18px rgba(46, 125, 50, 0.7);
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${css`${fadeIn} 0.8s ease-in-out forwards`};
  height: 500px;
  display: flex;
  flex-direction: column;
`;

const SubHeader = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: right;
  margin-bottom: 1.25rem;
  color: #2e7d32;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    right: 0;
    width: 3rem;
    height: 3px;
    background: linear-gradient(to right, #2e7d32, #facc15);
    border-radius: 2px;
  }
`;

const CasesTable = styled.div`
  width: 100%;
  overflow-x: auto;
  flex: 1;
  overflow-y: auto;
`;

const TableWrapper = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
`;

const TableHeader = styled.th`
  padding: 1rem;
  background: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
  font-weight: 600;
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
`;

const TableRow = styled.tr`
  &:hover {
    background: rgba(46, 125, 50, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #374151;
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(46, 125, 50, 0.1);
  border-radius: 0.5rem;
  font-weight: 600;
  color: #2e7d32;
  font-size: 1.1rem;
`;

const WeekNavigationButton = styled.button`
  padding: 0.5rem;
  background: #2e7d32;
  color: #ffffff;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: #1a4d1e;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
`;

const CalendarDayHeader = styled.div`
  font-weight: 600;
  color: #2e7d32;
  padding: 0.75rem;
  background: rgba(46, 125, 50, 0.05);
  border-radius: 0.375rem;
`;

const CalendarDayWrapper = styled.div`
  position: relative;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: ${props => (props.isSelected ? '#2e7d32' : props.isToday ? 'rgba(46, 125, 50, 0.1)' : 'transparent')};
  color: ${props => (props.isSelected ? '#ffffff' : props.isToday ? '#2e7d32' : '#374151')};
  border: ${props => (props.isToday ? '2px solid #2e7d32' : '1px solid rgba(0, 0, 0, 0.05)')};
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: ${props => (props.isSelected ? '#2e7d32' : 'rgba(46, 125, 50, 0.2)')};
    transform: scale(1.05);
  }
`;

const CalendarDayContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const DownloadIcon = styled(FaDownload)`
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 1rem;
  color: #2e7d32;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  ${CalendarDayWrapper}:hover & {
    opacity: 1;
  }
`;

const ScheduleSection = styled.div`
  margin-top: 1rem;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ScheduleList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  max-height: 190px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #2e7d32;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #1a4d1e;
  }
`;

const ScheduleItem = styled.div`
  background: ${props => props.bgColor || 'rgba(0, 0, 0, 0.05)'};
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: ${props => props.textColor || '#374151'};
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
  }
`;

const ScheduleItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ScheduleItemDate = styled.div`
  font-size: 0.85rem;
  color: white;
`;

const ScheduleItemTime = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
`;

const ScheduleItemDetails = styled.div`
  font-size: 0.9rem;
  color: ${props => props.textColor || '#374151'};
`;

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(moment().toDate());
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week').toDate());
const [stats, setStats] = useState({
  totalClients: 0,
  previousTotalClients: 0,
  totalSessions: 0,
  previousTotalSessions: 0,
  totalCases: 0,
  previousTotalCases: 0,
});


  const [latestCases, setLatestCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

    function getPercentageChange(current, previous) {
  if (previous === 0) {
    if (current === 0) return 0;
    return null; 
  }
  return ((current - previous) / previous) * 100;
}


const clientsChange = getPercentageChange(stats.totalClients, stats.previousTotalClients);
const sessionsChange = getPercentageChange(stats.totalSessions, stats.previousTotalSessions);
const casesChange = getPercentageChange(stats.totalCases, stats.previousTotalCases);


  const validateAndConvertSessions = (sessions) => {
    return sessions
      .map(session => ({
        ...session,
        start: new Date(session.start),
        end: new Date(session.end),
      }))
      .filter(session => {
        const isValid =
          session.start instanceof Date &&
          !isNaN(session.start) &&
          session.end instanceof Date &&
          !isNaN(session.end);
        if (!isValid) {
          console.warn(`Invalid date in session ID ${session._id}:`, session);
        }
        return isValid;
      });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('يرجى تسجيل الدخول أولاً');
          navigate('/login');
          return;
        }

        const response = await fetch('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Fetch stats error: Status ${response.status}, Message: ${errorData.message || 'No error message'}`);
          throw new Error(errorData.message || 'Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('فشل جلب الإحصائيات');
        if (error.message.includes('Invalid token') || error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    const fetchCases = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('يرجى تسجيل الدخول أولاً');
          navigate('/login');
          return;
        }

        const response = await fetch('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Fetch cases error: Status ${response.status}, Message: ${errorData.message || 'No error message'}`);
          throw new Error(errorData.message || 'Failed to fetch cases');
        }

        const data = await response.json();
        const mappedCases = data.map((affaire) => ({
          caseNumber: affaire.case_number || 'غير متوفر',
          clientName: affaire.client_id ? `${affaire.client_id.nom || ''} ${affaire.client_id.prenom || ''}`.trim() : 'غير متوفر',
          adversary: affaire.adversaire || 'غير متوفر',
          _id: affaire._id,
        }));
        setLatestCases(mappedCases.slice(0, 4));
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast.error('فشل جلب القضايا');
        if (error.message.includes('Invalid token') || error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
          return;
        }
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const validSessions = validateAndConvertSessions(response.data);
        setSessions(validSessions);
        if (response.data.length > validSessions.length) {
          toast.warn('بعض الجلسات تحتوي على تواريخ غير صالحة');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        if (error.response?.status === 401) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
        } else {
          toast.error('فشل جلب الجلسات');
        }
      }
    };

    fetchStats();
    fetchCases();
    fetchSessions();
  }, [navigate]);

  const daysOfWeek = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const scheduleKeys = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  const getWeekDates = (startDate) => {
    const dates = [];
    const weekStart = moment(startDate).startOf('week');
    for (let i = 0; i < 7; i++) {
      const date = moment(weekStart).add(i, 'days').toDate();
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    const newStart = moment(currentWeekStart).subtract(1, 'week').startOf('week').toDate();
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = moment(currentWeekStart).add(1, 'week').startOf('week').toDate();
    setCurrentWeekStart(newStart);
  };

  const handleDateClick = async (date, event) => {
    event.stopPropagation();
    setSelectedDate(date);

    if (!date || isNaN(date.getTime())) {
      toast.error('تاريخ غير صالح');
      return;
    }

    const formattedDate = moment(date).format('YYYY-MM-DD');
    console.log('Sending PDF request for date:', formattedDate); 

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/sessions/day/pdf?date=${formattedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sessions_${formattedDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل ملف PDF بنجاح');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (error.response) {
        if (error.response.status === 404) {
          toast.info('لا توجد جلسات لهذا اليوم');
        } else if (error.response.status === 401) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response.status === 400) {
          
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              toast.error(errorData.message || 'فشل تحميل ملف PDF: طلب غير صالح');
            } catch (e) {
              toast.error('فشل تحميل ملف PDF: خطأ في الطلب');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          toast.error('فشل تحميل ملف PDF');
        }
      } else {
        toast.error('فشل تحميل ملف PDF: خطأ في الاتصال');
      }
    }
  };

  const handleDaySelect = (date) => {
    setSelectedDate(date);
  };

  const isToday = (date) => {
    return moment(date).isSame(moment(), 'day');
  };

  const formatWeekRange = () => {
    const start = moment(weekDates[0]);
    const end = moment(weekDates[6]);
    return `${start.format('D MMMM')} - ${end.format('D MMMM YYYY')}`;
  };

  const caseHeaders = ['رقم الملف', "اسم الموكل", "الخصم"];

  const weeklySchedule = weekDates.reduce((acc, date, index) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const daySessions = sessions
      .filter(session => moment(session.start).format('YYYY-MM-DD') === dateStr)
      .map(session => ({
        time: moment(session.start).format('HH:mm'),
        client: session.client || 'Unknown Client',
        type: 'جلسة',
        color: {
          bg: '#2e7d32',
          text: '#ffffff',
        },
      }));
    acc[scheduleKeys[index]] = daySessions;
    return acc;
  }, {});

  return (
    <DashboardContainer>
      <NavDash />
      <Sidebar />
      <MainContent>
        <StatCardGrid>
          <StatCardWrapper>
            <StatTitle>إجمالي الموكلين</StatTitle>
            <StatValue>{stats.totalClients}</StatValue>
            {clientsChange !== null && clientsChange !== undefined ? (
              <StatPercentage isPositive={clientsChange >= 0}>
                <span>{clientsChange >= 0 ? '↑' : '↓'} {Math.abs(clientsChange).toFixed(2)}%</span>
              </StatPercentage>
            ) : (
              <StatPercentage isPositive={true}>
                <span>25%</span>
              </StatPercentage>
            )}
          </StatCardWrapper>



                  <StatCardWrapper>
            <StatTitle>إجمالي الجلسات</StatTitle>
            <StatValue>{stats.totalSessions}</StatValue>
            {sessionsChange !== null && sessionsChange !== undefined ? (
              <StatPercentage isPositive={sessionsChange >= 0}>
                <span>{sessionsChange >= 0 ? '↑' : '↓'} {Math.abs(sessionsChange).toFixed(2)}%</span>
              </StatPercentage>
            ) : (
              <StatPercentage isPositive={true}>
                <span>66%</span>
              </StatPercentage>
            )}
          </StatCardWrapper>

          <StatCardWrapper>
            <StatTitle>إجمالي الملفات</StatTitle>
            <StatValue>{stats.totalCases}</StatValue>
            {casesChange !== null && casesChange !== undefined ? (
              <StatPercentage isPositive={casesChange >= 0}>
                <span>{casesChange >= 0 ? '↑' : '↓'} {Math.abs(casesChange).toFixed(2)}%</span>
              </StatPercentage>
            ) : (
              <StatPercentage isPositive={true}>
                <span>80%</span>
              </StatPercentage>
            )}
          </StatCardWrapper>

        </StatCardGrid>

        <QuickActionsSection>
          <SubHeader>إجراءات سريعة</SubHeader>
          <QuickActionsGrid>
            <ActionButtonStyled onClick={() => navigate('/client-management')}>
              <FaUserPlus /> إضافة موكل
            </ActionButtonStyled>
            <ActionButtonStyled onClick={() => navigate('/sessions')}>
              <FaClock /> جدولة جلسة
            </ActionButtonStyled>
            <ActionButtonStyled onClick={() => navigate('/legal-case-management')}>
              <FaFileAlt /> إنشاء ملف
            </ActionButtonStyled>
            <ActionButtonStyled onClick={() => navigate('/appointment/new')}>
              <FaCheckCircle /> إضافة استشارة
            </ActionButtonStyled>
          </QuickActionsGrid>
        </QuickActionsSection>

        <MainGrid>
          <LeftColumn>
            <Section>
              <SubHeader>أحدث الملفات</SubHeader>
              <CasesTable>
                <TableWrapper>
                  <thead>
                    <tr>
                      {caseHeaders.map((header, index) => (
                        <TableHeader key={index}>{header}</TableHeader>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {latestCases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>لا توجد قضايا متاحة</TableCell>
                      </TableRow>
                    ) : (
                      latestCases.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>{row.caseNumber}</TableCell>
                          <TableCell>{row.clientName}</TableCell>
                          <TableCell>{row.adversary}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </tbody>
                </TableWrapper>
              </CasesTable>
            </Section>
          </LeftColumn>

          <RightColumn>
            <Section>
              <SubHeader>تخطيط الأسبوع</SubHeader>
              <CalendarContainer>
                <CalendarHeader>
                  <WeekNavigationButton onClick={handlePrevWeek}>
                    <FaChevronRight />
                  </WeekNavigationButton>
                  <span>{formatWeekRange()}</span>
                  <WeekNavigationButton onClick={handleNextWeek}>
                    <FaChevronLeft />
                  </WeekNavigationButton>
                </CalendarHeader>
                <CalendarGrid>
                  {daysOfWeek.map((day, index) => (
                    <CalendarDayHeader key={index}>{day}</CalendarDayHeader>
                  ))}
                  {weekDates.map((date, index) => (
                    <CalendarDayWrapper
                      key={index}
                      isSelected={moment(selectedDate).isSame(date, 'day')}
                      isToday={isToday(date)}
                      onClick={() => handleDaySelect(date)}
                    >
                      <CalendarDayContent>
                        {moment(date).format('D')}
                      </CalendarDayContent>
                      <DownloadIcon onClick={(event) => handleDateClick(date, event)} />
                    </CalendarDayWrapper>
                  ))}
                </CalendarGrid>
                <ScheduleSection>
                  <ScheduleList>
                    {weekDates.map((date, index) => {
                      const dayKey = scheduleKeys[index];
                      const daySessions = weeklySchedule[dayKey] || [];
                      return daySessions.length > 0 ? (
                        daySessions.map((session, idx) => (
                          <ScheduleItem
                            key={`${dayKey}-${idx}`}
                            bgColor={session.color.bg}
                            textColor={session.color.text}
                            onClick={() => handleDaySelect(date)}
                          >
                            <ScheduleItemHeader>
                              <ScheduleItemDate>
                                {moment(date).format('D/M')}
                              </ScheduleItemDate>
                              <ScheduleItemTime>{session.time}</ScheduleItemTime>
                            </ScheduleItemHeader>
                            <ScheduleItemDetails textColor={session.color.text}>
                              {session.client} - {session.type}
                            </ScheduleItemDetails>
                          </ScheduleItem>
                        ))
                      ) : null;
                    })}
                  </ScheduleList>
                </ScheduleSection>
              </CalendarContainer>
            </Section>
          </RightColumn>
        </MainGrid>
      </MainContent>
    </DashboardContainer>
  );
}

export default Dashboard;