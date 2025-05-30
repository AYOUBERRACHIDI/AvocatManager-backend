import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import moment from 'moment';
import { toast } from 'react-toastify';
import axios from 'axios';
import Select from 'react-select';
import { FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStickyNote, FaRedo, FaBriefcase } from 'react-icons/fa';
import NavDash from '../components/NavDash';
import Sidebar from '../components/Sidebar';

const pageFadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const FormContainer = styled.div`
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

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }
  @media (max-width: 768px) {
    padding: 1rem;
    margin-right: 0;
  }
`;

const FormSection = styled.div`
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: 1000px;
  max-width: 95%;
  margin: 0 auto;
  display: flex;
  border: 1px solid #2e7d32;
  animation: ${css`${pageFadeIn} 0.3s ease-in-out forwards`};

  @media (max-width: 1024px) {
    width: 90%;
  }
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormLeft = styled.div`
  flex: 3;
  padding: 0.75rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FormRight = styled.div`
  flex: 2;
  padding: 0.75rem;
  background: #f9f9f9;
  border-left: 0.5px solid #e0e0e0;

  @media (max-width: 768px) {
    border-left: none;
    border-top: 0.5px solid #e0e0e0;
    padding: 1rem;
  }
`;

const FormHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #333333;
  margin-bottom: 0.25rem;

  &::after {
    content: '${props => props.required ? '*' : ''}';
    color: #d32f2f;
    margin-right: 0.25rem;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #333333;
  min-height: 36px;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
  ${props => props.error ? `
    border-color: #d32f2f;
    background: #fff1f1;
  ` : ''}

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem;
    min-height: 44px;
  }
`;

const SelectStyled = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #333333;
  min-height: 36px;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
  ${props => props.error ? `
    border-color: #d32f2f;
    background: #fff1f1;
  ` : ''}

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem;
    min-height: 44px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #333333;
  resize: vertical;
  min-height: 60px;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem;
    min-height: 80px;
  }
`;

const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #d32f2f;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const RecurrenceSection = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const RecurrenceToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #333333;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToggleSummary = styled.button`
  display: none;
  padding: 0.5rem 1rem;
  background: #2e7d32;
  color: #ffffff;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  &:hover {
    background: #1b5e20;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const SummaryContent = styled.div`
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    margin-top: 0.5rem;
  }
`;

const SummaryText = styled.p`
  font-size: 0.75rem;
  color: #333333;
  margin: 0.5rem 0;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const DurationDisplay = styled.p`
  font-size: 0.75rem;
  color: #2e7d32;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #2e7d32;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  min-height: 36px;
  &:hover {
    background: #1b5e20;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    min-height: 44px;
  }
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  color: #333333;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  min-height: 36px;
  &:hover {
    background: #d0d0d0;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    min-height: 44px;
  }
`;

const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  background: #666666;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  min-height: 36px;
  &:hover {
    background: #555555;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    min-height: 44px;
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  background: #d32f2f;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  min-height: 36px;
  &:hover {
    background: #b71c1c;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    min-height: 44px;
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
  padding: 1.5rem;
  border-radius: 0.75rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalHeader = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 1rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`;

const ModalConfirmButton = styled.button`
  padding: 0.5rem 1rem;
  background: #d32f2f;
  color: #ffffff;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  &:hover {
    background: #b71c1c;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
  }
`;

const ModalCancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  color: #333333;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  &:hover {
    background: #d0d0d0;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
  }
`;

function tryParseNotes(notes) {
  try {
    return JSON.parse(notes);
  } catch (e) {
    console.warn('Failed to parse notes:', notes, e.message);
    return null;
  }
}

function AppointmentForm() {
  const { mode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const eventTypes = [
    { value: 'consultation', label: 'استشارة', color: '#4caf50' },
    { value: 'meeting', label: 'اجتماع مع الموكل بخصوص ملف', color: '#0288d1' },
  ];

  const statusOptions = [
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'pending', label: 'معلق' },
    { value: 'cancelled', label: 'ملغى' },
  ];

  const recurrenceOptions = [
    { value: 'none', label: 'غير متكرر' },
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
  ];

  const initialFormData = {
    client: '',
    client_id: '',
    type: 'consultation',
    affaire_id: '',
    aff: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    status: 'confirmed',
    notes: '',
    isRecurring: false,
    recurrenceFrequency: 'none',
    recurrenceEndDate: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editingEvent, setEditingEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
          return;
        }
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        if (error.response?.status === 401) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
        } else {
          toast.error('خطأ في جلب العملاء');
        }
      }
    };
    fetchClients();
  }, [navigate]);

  useEffect(() => {
    const fetchAffaires = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
          return;
        }
        const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAffaires(response.data);
      } catch (error) {
        console.error('Error fetching affaires:', error);
        if (error.response?.status === 401) {
          toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/login');
        } else {
          toast.error('خطأ في جلب القضايا');
        }
      }
    };
    fetchAffaires();
  }, [navigate]);

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
        setEvents(response.data);
      } catch (error) {
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
    if (mode === 'edit' && state?.event) {
      const event = state.event;
      setEditingEvent(event);
      const parsedNotes = tryParseNotes(event.notes) || { notes: event.notes, location: event.location };
      setFormData({
        client: event.client || '',
        client_id: event.client_id || '',
        type: event.type || 'consultation',
        affaire_id: event.affaire_id || '',
        aff: event.aff || '',
        date: event.start ? moment(event.start).format('YYYY-MM-DD') : '',
        startTime: event.start ? moment(event.start).format('HH:mm') : '',
        endTime: event.end ? moment(event.end).format('HH:mm') : '',
        location: parsedNotes.location || event.location || '',
        status: event.status || 'confirmed',
        notes: parsedNotes.notes || event.notes || '',
        isRecurring: !!event.recurrence,
        recurrenceFrequency: event.recurrence?.frequency || 'none',
        recurrenceEndDate: event.recurrence?.endDate ? moment(event.recurrence.endDate).format('YYYY-MM-DD') : '',
      });
    }
  }, [mode, state]);

  const handleInputChange = (name, value) => {
    if (name === 'client_id') {
      const selectedClient = clients.find(client => client._id === value);
      setFormData(prev => ({
        ...prev,
        client_id: value,
        client: selectedClient ? selectedClient.nom : '',
      }));
    } else if (name === 'affaire_id') {
      const selectedAffaire = affaires.find(affaire => affaire._id === value);
      setFormData(prev => ({
        ...prev,
        affaire_id: value,
        aff: selectedAffaire ? selectedAffaire.case_number : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'type' && value === 'consultation' ? { aff: '', affaire_id: '' } : {}),
      }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client_id) newErrors.client_id = 'الموكل مطلوب';
    if (formData.type === 'meeting' && !formData.affaire_id) {
      newErrors.affaire_id = 'رقم الملف مطلوب';
    }
    if (!formData.date) newErrors.date = 'التاريخ مطلوب';
    else {
      const today = moment().startOf('day');
      if (!moment(formData.date).isSameOrAfter(today)) {
        newErrors.date = 'التاريخ لا يمكن أن يكون في الماضي';
      }
    }
    if (!formData.startTime) newErrors.startTime = 'وقت البدء مطلوب';
    if (!formData.endTime) newErrors.endTime = 'وقت الانتهاء مطلوب';
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = 'الموقع مطلوب (3 أحرف على الأقل)';
    }

    if (formData.date && formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'وقت الانتهاء يجب أن يكون بعد وقت البدء';
      }
    }

    if (formData.isRecurring && formData.recurrenceFrequency !== 'none' && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'تاريخ انتهاء التكرار مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkConflicts = () => {
    if (!events || !formData.date || !formData.startTime || !formData.endTime) return [];

    const newStart = new Date(`${formData.date}T${formData.startTime}`);
    const newEnd = new Date(`${formData.date}T${formData.endTime}`);
    return events.filter(event => {
      if (editingEvent && event.id === editingEvent.id) return false;
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        moment(newStart).isSame(eventStart, 'day') &&
        (newStart < eventEnd && newEnd > eventStart)
      );
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'غير محدد';
    const diff = moment(end).diff(moment(start), 'minutes');
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? `${hours}س ` : ''}${minutes > 0 ? `${minutes}د` : ''}`.trim() || '0د';
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      toast.warn(
        `هذا الموعد يتعارض مع: ${conflicts.map(c => c.title).join(', ')}. هل تريد المتابعة؟`,
        {
          onClick: () => proceedWithSave(),
          autoClose: false,
          closeOnClick: false,
        }
      );
      return;
    }

    await proceedWithSave();
  };

  const proceedWithSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
        return;
      }

      const payload = {
        client: formData.client,
        type: formData.type,
        aff: formData.aff,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        status: formData.status,
        notes: formData.notes,
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency : 'none',
        recurrenceEndDate: formData.isRecurring && formData.recurrenceFrequency !== 'none' ? formData.recurrenceEndDate : null,
        affaire_id: formData.affaire_id || null,
      };

      let response;
      if (editingEvent) {
        response = await axios.put(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous/${editingEvent.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('تم تحديث الموعد بنجاح');
      } else {
        response = await axios.post('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('تم إنشاء الموعد بنجاح');
      }

      navigate('/calendar', {
        state: {
          action: editingEvent ? 'update' : 'add',
          event: response.data,
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
      } else if (error.response?.data?.message === 'Conflict with existing rendez-vous') {
        toast.warn(
          `هذا الموعد يتعارض مع: ${error.response.data.conflicts.map(c => c.title).join(', ')}. هل تريد المتابعة؟`,
          {
            onClick: async () => {
              try {
                const token = localStorage.getItem('token');
                const payload = {
                  client: formData.client,
                  type: formData.type,
                  aff: formData.aff,
                  date: formData.date,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  location: formData.location,
                  status: formData.status,
                  notes: formData.notes,
                  isRecurring: formData.isRecurring,
                  recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency : 'none',
                  recurrenceEndDate: formData.isRecurring && formData.recurrenceFrequency !== 'none' ? formData.recurrenceEndDate : null,
                  affaire_id: formData.affaire_id || null,
                };
                const response = editingEvent
                  ? await axios.put(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous/${editingEvent.id}`, payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                  : await axios.post('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous', payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                toast.success(editingEvent ? 'تم تحديث الموعد بنجاح' : 'تم إنشاء الموعد بنجاح');
                navigate('/calendar', {
                  state: {
                    action: editingEvent ? 'update' : 'add',
                    event: response.data,
                  },
                });
              } catch (err) {
                toast.error('خطأ أثناء حفظ الموعد');
              }
            },
            autoClose: false,
            closeOnClick: false,
          }
        );
      } else {
        toast.error(error.response?.data?.message || 'خطأ أثناء حفظ الموعد');
      }
    }
  };

  const handleCancel = () => {
    navigate('/calendar');
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/rendez-vous/${editingEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حذف الموعد بنجاح');
      navigate('/calendar', {
        state: { action: 'delete', eventId: editingEvent.id },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
      } else if (error.response?.data?.message === 'Cannot delete rendez-vous as it is associated with sessions') {
        toast.error(`لا يمكن حذف الموعد لأنه مرتبط بجلسات: ${error.response.data.sessions.map(s => s.salle).join(', ')}`);
      } else {
        toast.error('خطأ أثناء حذف الموعد');
      }
    }
    setShowDeleteModal(false);
  };

  const toggleSummary = () => {
    setIsSummaryOpen(!isSummaryOpen);
  };

  const clientOptions = clients.map(client => ({
    value: client._id,
    label: client.nom,
  }));

  const affaireOptions = affaires.map(affaire => ({
    value: affaire._id,
    label: affaire.case_number || 'غير محدد',
  }));

  return (
    <FormContainer>
      <Sidebar />
      <MainContent>
        <NavDash />
        <FormSection>
          <FormLeft>
            <FormHeader>{editingEvent ? 'تعديل موعد' : 'إنشاء موعد جديد'}</FormHeader>
            <FormGroup>
              <Label required>نوع الموعد</Label>
              <SelectStyled
                name="type"
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </SelectStyled>
            </FormGroup>
            <FormGroup>
              <Label required>الموكل</Label>
              <Select
                options={clientOptions}
                value={clientOptions.find(option => option.value === formData.client_id) || null}
                onChange={option => handleInputChange('client_id', option ? option.value : '')}
                placeholder="اختر الموكل..."
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    border: errors.client_id ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                    background: errors.client_id ? '#fff1f1' : '#ffffff',
                    minHeight: '36px',
                    fontSize: '0.75rem',
                    '&:hover': {
                      borderColor: errors.client_id ? '#d32f2f' : '#2e7d32',
                    },
                    boxShadow: state.isFocused ? '0 0 5px rgba(46, 125, 50, 0.3)' : 'none',
                    borderColor: state.isFocused ? '#2e7d32' : base.borderColor,
                    '@media (max-width: 768px)': {
                      fontSize: '0.875rem',
                      minHeight: '44px',
                    },
                  }),
                  menu: base => ({
                    ...base,
                    fontSize: '0.75rem',
                    '@media (max-width: 768px)': {
                      fontSize: '0.875rem',
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#2e7d32' : state.isFocused ? '#e8f5e9' : '#ffffff',
                    color: state.isSelected ? '#ffffff' : '#333333',
                    '&:hover': {
                      backgroundColor: '#e8f5e9',
                    },
                  }),
                  placeholder: base => ({
                    ...base,
                    color: '#666666',
                  }),
                }}
              />
              {errors.client_id && <ErrorMessage>{errors.client_id}</ErrorMessage>}
            </FormGroup>
            {formData.type === 'meeting' && (
              <FormGroup>
                <Label required>رقم الملف</Label>
                <Select
                  options={affaireOptions}
                  value={affaireOptions.find(option => option.value === formData.affaire_id) || null}
                  onChange={option => handleInputChange('affaire_id', option ? option.value : '')}
                  placeholder="اختر رقم الملف..."
                  isSearchable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: errors.affaire_id ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      background: errors.affaire_id ? '#fff1f1' : '#ffffff',
                      minHeight: '36px',
                      fontSize: '0.75rem',
                      '&:hover': {
                        borderColor: errors.affaire_id ? '#d32f2f' : '#2e7d32',
                      },
                      boxShadow: state.isFocused ? '0 0 5px rgba(46, 125, 50, 0.3)' : 'none',
                      borderColor: state.isFocused ? '#2e7d32' : base.borderColor,
                      '@media (max-width: 768px)': {
                        fontSize: '0.875rem',
                        minHeight: '44px',
                      },
                    }),
                    menu: base => ({
                      ...base,
                      fontSize: '0.75rem',
                      '@media (max-width: 768px)': {
                        fontSize: '0.875rem',
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#2e7d32' : state.isFocused ? '#e8f5e9' : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#333333',
                      '&:hover': {
                        backgroundColor: '#e8f5e9',
                      },
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#666666',
                    }),
                  }}
                />
                {errors.affaire_id && <ErrorMessage>{errors.affaire_id}</ErrorMessage>}
              </FormGroup>
            )}
            <FormGroup>
              <Label required>التاريخ</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                error={errors.date}
              />
              {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label required>وقت البدء</Label>
              <Input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={e => handleInputChange('startTime', e.target.value)}
                error={errors.startTime}
              />
              {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label required>وقت الانتهاء</Label>
              <Input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={e => handleInputChange('endTime', e.target.value)}
                error={errors.endTime}
              />
              {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
            </FormGroup>
            {formData.date && formData.startTime && formData.endTime && (
              <DurationDisplay>
                المدة: {calculateDuration(
                  `${formData.date}T${formData.startTime}`,
                  `${formData.date}T${formData.endTime}`
                )}
              </DurationDisplay>
            )}
            <FormGroup>
              <Label required>الموقع</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="أدخل الموقع"
                error={errors.location}
              />
              {errors.location && <ErrorMessage>{errors.location}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>الحالة</Label>
              <SelectStyled
                name="status"
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </SelectStyled>
            </FormGroup>
            <FormGroup>
              <Label>ملاحظات</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="أدخل أي ملاحظات إضافية"
              />
            </FormGroup>
            <RecurrenceSection>
              <RecurrenceToggle>
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={e => handleInputChange('isRecurring', e.target.checked)}
                />
                تكرار الموعد
              </RecurrenceToggle>
              {formData.isRecurring && (
                <>
                  <FormGroup>
                    <Label>تكرار</Label>
                    <SelectStyled
                      name="recurrenceFrequency"
                      value={formData.recurrenceFrequency}
                      onChange={e => handleInputChange('recurrenceFrequency', e.target.value)}
                    >
                      {recurrenceOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </SelectStyled>
                  </FormGroup>
                  {formData.recurrenceFrequency !== 'none' && (
                    <FormGroup>
                      <Label required>تاريخ انتهاء التكرار</Label>
                      <Input
                        type="date"
                        name="recurrenceEndDate"
                        value={formData.recurrenceEndDate}
                        onChange={e => handleInputChange('recurrenceEndDate', e.target.value)}
                        error={errors.recurrenceEndDate}
                      />
                      {errors.recurrenceEndDate && <ErrorMessage>{errors.recurrenceEndDate}</ErrorMessage>}
                    </FormGroup>
                  )}
                </>
              )}
            </RecurrenceSection>
            <FormButtons>
              <SaveButton onClick={handleSave}>حفظ</SaveButton>
              <CancelButton onClick={handleCancel}>إلغاء</CancelButton>
              <ResetButton onClick={handleReset}>إعادة تعيين</ResetButton>
              {editingEvent && (
                <DeleteButton onClick={() => setShowDeleteModal(true)}>حذف</DeleteButton>
              )}
            </FormButtons>
          </FormLeft>
          <FormRight>
            <SummaryHeader>
              <FormHeader>ملخص الموعد</FormHeader>
              <ToggleSummary onClick={toggleSummary}>
                {isSummaryOpen ? 'إخفاء' : 'إظهار'}
              </ToggleSummary>
            </SummaryHeader>
            <SummaryContent isOpen={isSummaryOpen}>
              <SummaryText>
                <FaUser />
                الموكل: {formData.client || 'غير محدد'}
              </SummaryText>
              {formData.type === 'meeting' && (
                <SummaryText>
                  <FaBriefcase />
                  رقم الملف: {formData.aff || 'غير محدد'}
                </SummaryText>
              )}
              <SummaryText>
                <FaCalendarAlt />
                التاريخ: {formData.date ? moment(formData.date).format('DD/MM/YYYY') : 'غير محدد'}
              </SummaryText>
              <SummaryText>
                <FaClock />
                الوقت: {formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'غير محدد'}
              </SummaryText>
              <SummaryText>
                <FaMapMarkerAlt />
                الموقع: {formData.location || 'غير محدد'}
              </SummaryText>
              <SummaryText>
                <FaStickyNote />
                الملاحظات: {formData.notes || 'لا توجد ملاحظات'}
              </SummaryText>
              {formData.isRecurring && (
                <SummaryText>
                  <FaRedo />
                  التكرار: {recurrenceOptions.find(opt => opt.value === formData.recurrenceFrequency)?.label || 'غير محدد'}
                  {formData.recurrenceFrequency !== 'none' && formData.recurrenceEndDate ? ` حتى ${moment(formData.recurrenceEndDate).format('DD/MM/YYYY')}` : ''}
                </SummaryText>
              )}
            </SummaryContent>
          </FormRight>
        </FormSection>
      </MainContent>
      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>تأكيد الحذف</ModalHeader>
            <p>هل أنت متأكد من حذف هذا الموعد؟</p>
            <ModalButtons>
              <ModalConfirmButton onClick={handleDelete}>حذف</ModalConfirmButton>
              <ModalCancelButton onClick={() => setShowDeleteModal(false)}>إلغاء</ModalCancelButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </FormContainer>
  );
}

export default AppointmentForm;