import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';
import styled, { keyframes, css } from 'styled-components';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminLayout from './AdminLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WelcomeBanner = styled.div`
  background: linear-gradient(to right, #2e7d32, #4ade80);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${css`${fadeIn} 0.5s ease-in-out`};
`;

const WelcomeTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const WelcomeMessage = styled.p`
  font-size: 1rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const StatTitle = styled.h3`
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const StatValue = styled.p`
  font-size: 1.75rem;
  font-weight: bold;
  color: #2e7d32;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2e7d32;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background: #4ade80;
    transform: translateY(-2px);
  }

  & > svg {
    width: 20px;
    height: 20px;
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  canvas {
    max-height: 300px;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 1rem;
  text-align: center;
`;

const ActivityLogsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${css`${fadeIn} 0.5s ease-in-out`};
`;

const ActivityLogsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 1rem;
`;

const ActivityLogsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  background: #f8fafc;
  color: #4b5563;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: right;
  color: #374151;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f1f5f9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #6b7280;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAvocats: 0,
    totalSecretaires: 0,
    totalMessages: 0,
  });
  const [avocatsByCity, setAvocatsByCity] = useState([]);
  const [secretairesByAvocat, setSecretairesByAvocat] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        toast.error('خطأ في جلب الإحصائيات: ' + (err.response?.data?.message || 'خطأ غير معروف'));
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    const fetchAvocatsByCity = async () => {
      try {
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/avocats-by-city', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvocatsByCity(response.data);
      } catch (err) {
        toast.error('خطأ في جلب إحصائيات المحامين حسب المدينة: ' + (err.response?.data?.message || 'خطأ غير معروف'));
        setAvocatsByCity([
          { city: 'الدار البيضاء', count: 15 },
          { city: 'الرباط', count: 10 },
          { city: 'مراكش', count: 8 },
        ]);
      }
    };

    const fetchSecretairesByAvocat = async () => {
      try {
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires-by-avocat', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecretairesByAvocat(response.data);
      } catch (err) {
        toast.error('خطأ في جلب إحصائيات السكرتيرات حسب المحامي: ' + (err.response?.data?.message || 'خطأ غير معروف'));
        setSecretairesByAvocat([
          { avocat: 'محمد أحمد', count: 3 },
          { avocat: 'فاطمة علي', count: 2 },
          { avocat: 'عبد الله حسن', count: 1 },
        ]);
      }
    };

    const fetchActivityLogs = async () => {
      try {
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/activity-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivityLogs(response.data);
      } catch (err) {
        toast.error('خطأ في جلب سجل الأنشطة: ' + (err.response?.data?.message || 'خطأ غير معروف'));
        setActivityLogs([]);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchAvocatsByCity(), fetchSecretairesByAvocat(), fetchActivityLogs()]);
      setIsLoading(false);
    };

    fetchData();
  }, [navigate]);

  const avocatsByCityLabels = avocatsByCity.map(item => item.city);
  const avocatsByCityData = avocatsByCity.map(item => item.count);
  const secretairesByAvocatLabels = secretairesByAvocat.map(item => item.avocat);
  const secretairesByAvocatData = secretairesByAvocat.map(item => item.count);

  const barChartData = {
    labels: avocatsByCityLabels,
    datasets: [
      {
        label: 'عدد المحامين',
        data: avocatsByCityData,
        backgroundColor: '#2e7d32',
        borderColor: '#1a4d1e',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#374151', font: { size: 14 } },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#2e7d32',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#374151', font: { size: 12 } },
      },
    },
  };

  const pieChartData = {
    labels: secretairesByAvocatLabels,
    datasets: [
      {
        label: 'عدد السكرتيرات',
        data: secretairesByAvocatData,
        backgroundColor: ['#2e7d32', '#4ade80', '#a3e635', '#65a30d'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#374151', font: { size: 14 } },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#2e7d32',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <AdminLayout>
      <WelcomeBanner>
        <WelcomeTitle>مرحبًا، إداري!</WelcomeTitle>
        <WelcomeMessage>ابدأ يومك بإدارة المحامين والسكرتيرات بفعالية.</WelcomeMessage>
      </WelcomeBanner>
      <StatsGrid>
        <StatCard>
          <StatTitle>إجمالي المحامين</StatTitle>
          <StatValue>{stats.totalAvocats}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>إجمالي السكرتيرات</StatTitle>
          <StatValue>{stats.totalSecretaires}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>إجمالي الرسائل</StatTitle>
          <StatValue>{stats.totalMessages}</StatValue>
        </StatCard>
      </StatsGrid>
      <QuickActions>
        <ActionButton to="/admin-avocats">
          <PlusIcon />
          إضافة محامي
        </ActionButton>
        <ActionButton to="/admin-secretaires">
          <PlusIcon />
          إضافة سكرتير
        </ActionButton>
      </QuickActions>
      {(avocatsByCity.length > 0 || secretairesByAvocat.length > 0) && !isLoading ? (
        <ChartsRow>
          {avocatsByCity.length > 0 ? (
            <ChartContainer>
              <ChartTitle>المحامون حسب المدينة</ChartTitle>
              <Bar data={barChartData} options={barChartOptions} />
            </ChartContainer>
          ) : (
            <LoadingMessage>لا توجد بيانات للمحامين حسب المدينة</LoadingMessage>
          )}
          {secretairesByAvocat.length > 0 ? (
            <ChartContainer>
              <ChartTitle>السكرتيرات حسب المحامي</ChartTitle>
              <Pie data={pieChartData} options={pieChartOptions} />
            </ChartContainer>
          ) : (
            <LoadingMessage>لا توجد بيانات للسكرتيرات حسب المحامي</LoadingMessage>
          )}
        </ChartsRow>
      ) : (
        <LoadingMessage>جارٍ تحميل البيانات...</LoadingMessage>
      )}
      <ActivityLogsSection>
        <ActivityLogsTitle>سجل الأنشطة الأخيرة</ActivityLogsTitle>
        {activityLogs.length > 0 ? (
          <ActivityLogsTable>
            <thead>
              <tr>
                <TableHeader>النشاط</TableHeader>
                <TableHeader>التفاصيل</TableHeader>
                <TableHeader>التاريخ</TableHeader>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </ActivityLogsTable>
        ) : (
          <LoadingMessage>لا توجد أنشطة مسجلة</LoadingMessage>
        )}
      </ActivityLogsSection>
    </AdminLayout>
  );
}

export default AdminDashboard;