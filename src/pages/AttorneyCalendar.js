import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaPlus, FaDownload, FaComments, FaUsers, FaClock, FaSearch } from 'react-icons/fa';

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

const localizer = momentLocalizer(moment);

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

const CalendarContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  direction: rtl;
`;

const MainContent = styled.div`
  flex: 1;
  margin-right: 70px;
  margin-top: 60px;
  padding: 2rem;
  overflow-y: auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-right: 0;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: rgb(0, 0, 0);

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const AddButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: #2e7d32;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #1b5e20;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 1rem;
    font-size: 0.75rem;
  }
`;

const ExportButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: #0288d1;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #01579b;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 1rem;
    font-size: 0.75rem;
  }
`;

const FilterSearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 250px;
  transition: all 0.3s ease-in-out;

  &:focus-within {
    border-color: #2e7d32;
    box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #333333;
  flex: 1;
  background: transparent;

  &::placeholder {
    color: #666666;
  }
`;

const SearchIcon = styled(FaSearch)`
  color: #666666;
  margin-left: 0.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #333333;
  background: #ffffff;
  width: 150px;
  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClearFilters = styled.button`
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  color: #333333;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #d0d0d0;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
`;

const CalendarSection = styled.div`
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  animation: ${css`${fadeIn} 0.8s ease-in-out forwards`};

  @media (min-width: 769px) {
    padding: 1.5rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  direction: rtl;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2e7d32;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;

  &:hover {
    color: #2e7d32;
  }
`;

const ModalCalendar = styled(Calendar)`
  .rbc-calendar {
    min-height: 400px;
    height: 400px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .rbc-month-view {
    .rbc-month-row {
      min-height: 60px;
    }

    .rbc-date-cell {
      cursor: pointer;
      text-align: center;
      font-size: 0.875rem;
      padding: 0.5rem;

      &.rbc-off-range {
        color: #999999;
      }

      &:hover {
        background: rgba(46, 125, 50, 0.1);
      }

      &.rbc-selected {
        background: #2e7d32;
        color: #ffffff;
        border-radius: 0.25rem;
      }
    }
  }

  .rbc-toolbar {
    margin-bottom: 1rem;
    .rbc-toolbar-label {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2e7d32;
    }

    .rbc-btn-group {
      button {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        color: #2e7d32;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;

        &:hover {
          background: #2e7d32;
          color: #ffffff;
        }
      }
    }
  }
`;

const StyledCalendar = styled(Calendar)`
  .rbc-calendar {
    min-height: 900px;
    height: auto;
    @media (max-width: 768px) {
      min-height: 600px;
    }
  }

  .rbc-toolbar {
    margin-bottom: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    direction: rtl;
    background: #f9f9f9;
    padding: 0.75rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    .rbc-toolbar-label {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2e7d32;
      text-align: center;
      flex: 1;
      margin: 0 1rem;
      @media (max-width: 768px) {
        font-size: 1rem;
        margin: 0.5rem 0;
      }
    }

    .rbc-btn-group {
      display: flex;
      gap: 0.5rem;

      button {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        color: #2e7d32;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &:hover {
          background: #2e7d32;
          color: #ffffff;
          border-color: #2e7d32;
        }

        &:focus {
          outline: 2px solid #2e7d32;
        }

        &.rbc-active {
          background: #2e7d32;
          color: #ffffff;
          border-color: #2e7d32;
        }

        @media (max-width: 768px) {
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
        }
      }

      &:first-child {
        margin-right: 1rem;
      }

      &:last-child {
        margin-left: 1rem;
      }
    }
  }

  .rbc-event {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    border-radius: 0.25rem;
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 120px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    white-space: normal;
    overflow-wrap: break-word;
    z-index: 1;
    margin: 2px 0;

    &[data-type="consultation"] {
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    }
    &[data-type="meeting"] {
      background: linear-gradient(135deg, #0288d1 0%, #01579b 100%);
    }
    &[data-type="deadline"] {
      background: linear-gradient(135deg, #7b1fa2 0%, #4a0072 100%);
    }

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      z-index: 2;
    }

    &:focus {
      outline: 2px solid #2e7d32;
    }

    @media (max-width: 768px) {
      font-size: 0.875rem;
      padding: 0.5rem;
      min-height: 30px;
    }
  }

  .rbc-event-content {
    white-space: normal;
    line-height: 1.4;
    overflow: visible;
    font-size: inherit;
  }

  .rbc-time-view {
    border: 1px solid #e0e0e0;
    min-height: 800px;
    @media (max-width: 768px) {
      min-height: 500px;
    }

    .rbc-time-header {
      background: #ffffff;
      border-bottom: 1px solid #e0e0e0;

      .rbc-header {
        font-weight: 600;
        color: #2e7d32;
        padding: 0.75rem;
        font-size: 1rem;
        @media (max-width: 768px) {
          font-size: 0.875rem;
        }
      }
    }

    .rbc-time-content {
      border-top: none;
      overflow: visible;

      .rbc-time-gutter {
        background: #f5f5f5;

        .rbc-timeslot-group {
          font-size: 0.875rem;
          color: #333333;
          padding: 0.5rem;
          @media (max-width: 768px) {
            font-size: 0.75rem;
          }
        }
      }

      .rbc-current-time-indicator {
        background: #d32f2f;
        height: 2px;
      }
    }

    .rbc-time-slot {
      min-height: 40px;
      min-width: 100px;
      @media (max-width: 768px) {
        min-height: 30px;
        min-width: 80px;
      }
    }
  }

  .rbc-month-view {
    border: 1px solid #e0e0e0;

    .rbc-month-row {
      min-height: 300px;
      @media (max-width: 768px) {
        min-height: 100px;
      }

      .rbc-row-bg {
        .rbc-day-bg.rbc-today {
          background: rgba(46, 125, 50, 0.2);
          border: 1px solid #2e7d32;
        }
      }

      .rbc-date-cell {
        font-size: 0.875rem;
        color: #333333;
        padding: 0.75rem;
        text-align: center;

        &.rbc-now {
          background: #2e7d32;
          color: #ffffff;
          border-radius: 0.25rem;
        }

        @media (max-width: 768px) {
          font-size: 0.75rem;
          padding: 0.5rem;
        }
      }
    }

    .rbc-event {
      margin: 0.5rem 0.25rem;
      @media (max-width: 768px) {
        margin: 0.3rem 0.2rem;
      }
    }
  }

  .rbc-agenda-view {
    .rbc-agenda-date-cell,
    .rbc-agenda-time-cell {
      font-size: 0.875rem;
      color: #333333;
    }

    .rbc-agenda-event-cell {
      font-size: 0.875rem;
      color: #2e7d32;
    }
  }

  .rbc-time-header-content {
    .rbc-time-header {
      display: flex;

      .rbc-header {
        flex: 1;
        text-align: center;
      }
    }
  }

  .rbc-time-content {
    .rbc-day-slot {
      &.rbc-time-column {
        .rbc-timeslot-group {
          min-height: 40px;
        }
      }
    }
  }
`;

const AgendaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AgendaDateHeader = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin: 1rem 0 0.5rem;

  @media (max-width: 768px) {
    font-size:

 1rem;
  }
`;

const AgendaEvent = styled.div`
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.bgColor || '#2e7d32'};
  transition: transform 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: 2px solid #2e7d32;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const AgendaEventTime = styled.p`
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const AgendaEventDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #333333;
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const AgendaEventLocation = styled.p`
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #666666;
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const AgendaEventNotes = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #666666;
  font-style: italic;
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

function AttorneyCalendar() {
  const [view, setView] = useState(() => localStorage.getItem('calendarView') || 'week');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExportDate, setSelectedExportDate] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const eventTypes = [
    { value: 'consultation', label: 'استشارة', color: '#4caf50', icon: <FaComments /> },
    { value: 'meeting', label: 'اجتماع مع الموكل بخصوص الملف', color: '#0288d1', icon: <FaUsers /> },
    { value: 'deadline', label: 'موعد نهائي', color: '#7b1fa2', icon: <FaClock /> },
  ];

  const statusOptions = [
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'pending', label: 'معلق' },
    { value: 'cancelled', label: 'ملغى' },
  ];

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const headers = [
    { label: 'الوقت', key: 'time' },
    { label: 'الموكل', key: 'client' },
    { label: 'النوع', key: 'type' },
    { label: 'الموقع', key: 'location' },
    { label: 'الحالة', key: 'status' },
    { label: 'رقم الملف', key: 'aff' },
    { label: 'الملاحظات', key: 'notes' },
  ];

  const validateAndConvertEvents = (events) => {
    return events
      .map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
      .filter(event => {
        const isValid =
          event.start instanceof Date &&
          !isNaN(event.start) &&
          event.end instanceof Date &&
          !isNaN(event.end);
        if (!isValid) {
          console.warn(`Invalid date in event ID ${event.id}:`, event);
        }
        return isValid;
      });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
          return;
        }
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const validEvents = validateAndConvertEvents(response.data);
        setEvents(validEvents);
        if (response.data.length > validEvents.length) {
          toast.warn('تم تجاهل بعض المواعيد بسبب تواريخ غير صالحة');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        if (error.response?.status === 401) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
        } else {
          toast.error('خطأ في جلب المواعيد');
        }
      }
    };
    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.action && (location.state?.event || location.state?.eventId)) {
      const { action, event, eventId } = location.state;
      if (action === 'add' && event) {
        const newEvent = {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        };
        if (!isNaN(newEvent.start) && !isNaN(newEvent.end)) {
          setEvents(prev => [...prev, newEvent]);
          toast.success(`تم إضافة موعد ${event.client} بنجاح`);
        } else {
          toast.error('فشل في إضافة الموعد بسبب تاريخ غير صالح');
        }
      } else if (action === 'update' && event) {
        const updatedEvent = {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        };
        if (!isNaN(updatedEvent.start) && !isNaN(updatedEvent.end)) {
          setEvents(prev => prev.map(e => (e.id === event.id ? updatedEvent : e)));
          toast.success(`تم تحديث موعد ${event.client} بنجاح`);
        } else {
          toast.error('فشل في تحديث الموعد بسبب تاريخ غير صالح');
        }
      } else if (action === 'delete' && eventId) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        toast.success('تم حذف الموعد بنجاح');
      }
      navigate('/calendar', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    localStorage.setItem('calendarView', view);
  }, [view]);

  const filteredEvents = useMemo(() => {
    const result = events.filter(event => {
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        (event.client && event.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.notes && event.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.aff && event.aff.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
    if (view === 'day') {
      const dayEvents = result.filter(event =>
        moment(event.start).isSame(moment(date), 'day')
      );
      console.log('Day view events:', dayEvents);
    }
    return result;
  }, [events, filterType, filterStatus, searchQuery, view, date]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const calculateDuration = (start, end) => {
    const diff = moment(end).diff(moment(start), 'minutes');
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? `${hours}س ` : ''}${minutes > 0 ? `${minutes}د` : ''}`.trim() || '0د';
  };

  const handleAddAppointment = () => {
    navigate('/appointment/new', { state: { events } });
  };

  const handleSelectEvent = (event) => {
    navigate('/appointment/edit', { state: { event, events } });
  };

   const handleOpenExportModal = () => {
    setShowModal(true);
    setSelectedExportDate(new Date());
  };

  const handleCloseExportModal = () => {
    setShowModal(false);
    setSelectedExportDate(null);
  };

  const handleSelectExportDate = async ({ start }) => {
    if (!start) return;
    setSelectedExportDate(start);
    setShowModal(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const backendEvents = validateAndConvertEvents(response.data);

      const selectedDate = moment(start).startOf('day');
      const dayEvents = backendEvents
        .filter(event => moment(event.start).isSame(selectedDate, 'day'))
        .filter(event => {
          const matchesType = filterType === 'all' || event.type === filterType;
          const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
          const matchesSearch =
            searchQuery === '' ||
            (event.client && event.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.notes && event.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.aff && event.aff.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesType && matchesStatus && matchesSearch;
        });

      if (dayEvents.length === 0) {
        toast.error('لا توجد مواعيد أو استشارات لهذا اليوم');
        return;
      }

      const data = dayEvents.map(event => ({
        'الوقت': `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')} (${calculateDuration(event.start, event.end)})`,
        'الموكل': event.client || '-',
        'النوع': eventTypes.find(t => t.value === event.type)?.label || event.type,
        'الموقع': event.location || '-',
        'الحالة': statusOptions.find(s => s.value === event.status)?.label || event.status,
        'رقم الملف': event.aff || '-',
        'الملاحظات': event.notes || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data, {
        header: headers.map(h => h.label),
        skipHeader: false,
      });

      worksheet['!rtl'] = true;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, `schedule_${moment(start).format('YYYY-MM-DD')}.xlsx`);

      toast.success('تم تصدير الجدول اليومي كملف Excel بنجاح');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      if (error.response?.status === 401) {
        toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
      } else {
        toast.error('خطأ في تصدير الجدول اليومي');
      }
    }
  };

  const CustomAgendaView = ({ events, date }) => {
    const startOfWeek = moment(date).startOf('week');
    const endOfWeek = moment(date).endOf('week');
    const weekEvents = events.filter(event =>
      moment(event.start).isBetween(startOfWeek, endOfWeek, null, '[]')
    );

    const groupedEvents = weekEvents.reduce((acc, event) => {
      const dateStr = moment(event.start).format('YYYY-MM-DD');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(event);
      return acc;
    }, {});

    return (
      <AgendaList>
        {Object.keys(groupedEvents).map(date => (
          <div key={date}>
            <AgendaDateHeader>
              {moment(date).locale('ar').format('dddd، D MMMM YYYY')}
            </AgendaDateHeader>
            {groupedEvents[date].map(event => (
              <AgendaEvent
                key={event.id}
                bgColor={event.color}
                onClick={() => handleSelectEvent(event)}
                tabIndex={0}
                onKeyPress={e => e.key === 'Enter' && handleSelectEvent(event)}
              >
                <AgendaEventTime>
                  {`${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')} (${calculateDuration(event.start, event.end)})`}
                </AgendaEventTime>
                <AgendaEventDetail>{event.client}</AgendaEventDetail>
                <AgendaEventDetail>{eventTypes.find(t => t.value === event.type)?.label || event.type}</AgendaEventDetail>
                <AgendaEventDetail>{event.aff ? `رقم الملف: ${event.aff}` : 'لا يوجد رقم الملف'}</AgendaEventDetail>
                <AgendaEventLocation>
                  {event.location} - {statusOptions.find(s => s.value === event.status)?.label || event.status}
                </AgendaEventLocation>
                {event.notes && <AgendaEventNotes>{event.notes}</AgendaEventNotes>}
              </AgendaEvent>
            ))}
          </div>
        ))}
        {weekEvents.length === 0 && (
          <p style={{ color: '#333333', textAlign: 'center' }}>لا توجد مواعيد هذا الأسبوع</p>
        )}
      </AgendaList>
    );
  };

  return (
    <CalendarContainer>
      <NavDash />
      <Sidebar />
      <MainContent>
        <HeaderSection>
          <Title>التقويم</Title>
          <ActionButtons>
            <AddButton onClick={handleAddAppointment}>
              <FaPlus /> إضافة موعد
            </AddButton>
            <ExportButton onClick={handleOpenExportModal}>
              <FaDownload /> تحميل
            </ExportButton>
          </ActionButtons>
        </HeaderSection>

        <FilterSearchBar>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="ابحث حسب الموكل، الملاحظات، أو رقم الملف"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <SearchIcon />
          </SearchContainer>
          <FilterSelect value={filterType} onChange={handleFilterTypeChange}>
            <option value="all">كل الأنواع</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={filterStatus} onChange={handleFilterStatusChange}>
            <option value="all">كل الحالات</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </FilterSelect>
          <ClearFilters onClick={handleClearFilters}>مسح الكل</ClearFilters>
        </FilterSearchBar>

        <CalendarSection>
          <StyledCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            defaultDate={new Date()}
            onSelectEvent={handleSelectEvent}
            min={new Date(0, 0, 0, 9, 0)}
            max={new Date(0, 0, 0, 18, 0)}
            formats={{
              timeGutterFormat: (date, culture, localizer) =>
                view === 'day' ? localizer.format(date, 'HH:mm', culture) : '',
              eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                view === 'day'
                  ? `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
                  : localizer.format(start, 'D MMMM', culture),
              dayHeaderFormat: 'dddd D MMMM',
            }}
            components={{
              agenda: CustomAgendaView,
              event: ({ event }) => (
                <span>
                  {eventTypes.find(t => t.value === event.type)?.icon || <FaComments />}
                  {' '}
                  {event.title}
                </span>
              ),
            }}
            eventPropGetter={event => ({
              'data-type': event.type,
            })}
            messages={{
              today: 'اليوم',
              previous: 'السابق',
              next: 'التالي',
              month: 'شهر',
              week: 'أسبوع',
              day: 'يوم',
              agenda: 'جدول أعمال',
            }}
            timeslots={2}
            step={30}
          />
        </CalendarSection>

        {showModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>اختر تاريخ التصدير</ModalTitle>
                <CloseButton onClick={handleCloseExportModal}>×</CloseButton>
              </ModalHeader>
              <ModalCalendar
                localizer={localizer}
                events={[]}
                view="month"
                date={selectedExportDate || new Date()}
                onNavigate={setSelectedExportDate}
                onSelectSlot={handleSelectExportDate}
                selectable
                dayPropGetter={date => {
                  const isSelected = selectedExportDate && moment(date).isSame(moment(selectedExportDate), 'day');
                  return {
                    className: isSelected ? 'rbc-selected' : '',
                  };
                }}
                messages={{
                  today: 'اليوم',
                  previous: 'السابق',
                  next: 'التالي',
                  month: 'شهر',
                }}
              />
            </ModalContent>
          </ModalOverlay>
        )}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </MainContent>
    </CalendarContainer>
  );
}

export default AttorneyCalendar;