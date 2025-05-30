import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaEye, FaEdit, FaTrash, FaDownload, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaLock } from 'react-icons/fa';
import { GlassesIcon as MagnifyingGlassIcon, XCircleIcon } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const theme = {
  primary: '#2e7d32',
  primaryDark: '#059669',
  secondary: '#6b7280',
  background: '#f9fafb',
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  error: '#ef4444',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SecretaryContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.background};
  direction: rtl;
  // font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  margin-right: 70px;
  margin-top: 60px;
  padding: 1.5rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-right: 0;
    padding: 1rem;
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
  font-size: 1.875rem;
  font-weight: 600;
  color: ${theme.textPrimary};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    right: 0;
    width: 2.5rem;
    height: 4px;
    background: ${theme.primary};
    border-radius: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${theme.error};

  &:hover {
    background: #dc2626;
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 1.5rem;
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SecretariesTable = styled.div`
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${css`${fadeIn} 0.5s ease-out`};
  overflow-x: auto;
`;

const TableWrapper = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  background: ${theme.primary}10;
  color: ${theme.textPrimary};
  font-weight: 500;
  text-align: right;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.primary}20;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.02);
  }

  &:hover {
    background: ${theme.primary}05;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  color: ${theme.textPrimary};
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.button`
  padding: 0.5rem;
  background: ${props => props.bgColor};
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.hoverColor};
    transform: translateY(-1px);
  }

  &:hover:after {
    content: attr(title);
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.textPrimary};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const Checkbox = styled.input`
  accent-color: ${theme.primary};
  width: 1rem;
  height: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => (props.active ? theme.primary : 'white')};
  color: ${props => (props.active ? 'white' : theme.textPrimary)};
  border: 1px solid ${props => (props.active ? theme.primary : '#d1d5db')};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => (props.active ? theme.primaryDark : '#f3f4f6')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: ${css`${modalSlideIn} 0.3s ease-out`};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  color: ${theme.textSecondary};
  font-size: 1.25rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.error};
  }
`;

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.textPrimary};
`;

const FormInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormInputIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  color: ${theme.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none;
`;

const FormInput = styled.input`
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.2s ease;
  text-align: right;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }

  &:invalid[required] {
    border-color: ${theme.error};
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem;
  background: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  grid-column: span 2;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.textSecondary};
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  color: ${theme.textPrimary};
`;

const CloseDetailsButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  grid-column: span 2;
  display: flex;
  justify-content: center;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SkeletonRow = styled.tr`
  height: 3rem;
`;

const SkeletonCell = styled.td`
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const SortArrow = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
`;
const ToastOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ToastContent = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  font-family: 'Amiri', 'Noto Sans Arabic', sans-serif;
  font-size: 0.9rem;
  text-align: center;
`;

const SearchBar = ({ onSearch, placeholder = 'بحث...', initialValue = '', className = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedSearch = useCallback(debounce((term) => onSearch(term), 300), [onSearch]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full py-2 px-4 pl-10 pr-12 bg-white rounded-md border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-secondary text-right dir-rtl"
        dir="rtl"
        aria-label="بحث السكرتارية"
        maxLength={100}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-secondary" />
      </div>
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 left-0 flex items-center pl-3 hover:text-error"
          aria-label="Clear search"
        >
          <XCircleIcon className="h-5 w-5 text-secondary hover:text-error" />
        </button>
      )}
    </div>
  );
};

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/secretaires';

function SecretaryManagement({ setToken }) {


  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [secretaries, setSecretaries] = useState([]);
  const [selectedSecretaries, setSelectedSecretaries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newSecretary, setNewSecretary] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    ville: '',
    email: '',
    password: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSecretary, setSelectedSecretary] = useState(null);
  const secretariesPerPage = 5;

  const toastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.', toastOptions);
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecretaries(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
        } else {
          setError('فشل جلب البيانات');
          toast.error('فشل جلب البيانات', toastOptions);
          console.error('Fetch error:', err.response?.data || err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setToken]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const filteredSecretaries = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return secretaries.filter(
      secretary =>
        (secretary.nom && secretary.nom.toLowerCase().includes(searchLower)) ||
        (secretary.prenom && secretary.prenom.toLowerCase().includes(searchLower)) ||
        (secretary.email && secretary.email.toLowerCase().includes(searchLower))
    );
  }, [secretaries, searchTerm]);

  const sortedSecretaries = [...filteredSecretaries].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(sortedSecretaries.length / secretariesPerPage);
  const paginatedSecretaries = sortedSecretaries.slice(
    (currentPage - 1) * secretariesPerPage,
    currentPage * secretariesPerPage
  );

  const headers = [
    { label: '', key: '' }, 
    { label: 'الاسم', key: 'nom' },
    { label: 'اللقب', key: 'prenom' },
    { label: 'الهاتف', key: 'telephone' },
    { label: 'العنوان', key: 'adresse' },
    { label: 'المدينة', key: 'ville' },
    { label: 'البريد الإلكتروني', key: 'email' },
    { label: 'الإجراءات', key: '' },
  ];

  const handleSort = (key) => {
    if (key) {
      setSortConfig({
        key,
        direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  const handleExport = () => {
  const validHeaders = headers.filter(h => h.key);

  const exportData = secretaries.map(row => {
    const rowData = {};
    validHeaders.forEach(header => {
      rowData[header.label] = row[header.key] || '';
    });
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Secrétaires');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `secretaries_${new Date().toISOString().split('T')[0]}.xlsx`);

  toast.success('تم تحميل البيانات بنجاح', toastOptions);
};

  const handleCheckboxChange = (id) => {
    setSelectedSecretaries(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.', toastOptions);
      window.location.href = '/login';
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف السكرتارية المحددين؟')) {
      try {
        await Promise.all(
          selectedSecretaries.map(id =>
            axios.delete(`${API_URL}/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setSecretaries(prev => prev.filter(s => !selectedSecretaries.includes(s._id)));
        setSelectedSecretaries([]);
        toast.success('تم حذف السكرتارية المحددين بنجاح', toastOptions);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
        } else {
          toast.error('فشل حذف السكرتارية', toastOptions);
          console.error('Bulk delete error:', err.response?.data || err.message);
        }
      }
    }
  };

  const handleModalOpen = (secretary = null) => {
    if (secretary) {
      setNewSecretary({
        nom: secretary.nom || '',
        prenom: secretary.prenom || '',
        telephone: secretary.telephone || '',
        adresse: secretary.adresse || '',
        ville: secretary.ville || '',
        email: secretary.email || '',
        password: '', 
      });
      setEditingId(secretary._id);
    } else {
      setNewSecretary({
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        ville: '',
        email: '',
        password: '',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSecretary({
      nom: '',
      prenom: '',
      telephone: '',
      adresse: '',
      ville: '',
      email: '',
      password: '',
    });
    setEditingId(null);
  };
const confirmToast = (message, onConfirm) => {
  const toastRoot = document.createElement('div');
  document.body.appendChild(toastRoot);

  const root = ReactDOM.createRoot(toastRoot);

  const handleClose = () => {
    root.unmount(); 
    document.body.removeChild(toastRoot);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const ToastComponent = () => (
    <AnimatePresence>
      <ToastOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ToastContent
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center gap-4">
            <span className="text-gray-800 font-medium">{message}</span>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleConfirm}
              >
                تأكيد
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                onClick={handleClose}
              >
                إلغاء
              </button>
            </div>
          </div>
        </ToastContent>
      </ToastOverlay>
    </AnimatePresence>
  );

  root.render(<ToastComponent />);
};
  const handleNewSecretaryChange = (e) => {
    const { name, value } = e.target;
    setNewSecretary(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrEditSecretary = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.', toastOptions);
      window.location.href = '/login';
      return;
    }

    if (!newSecretary.nom) {
      toast.error('يرجى إدخال الاسم', toastOptions);
      return;
    }
    if (!newSecretary.prenom) {
      toast.error('يرجى إدخال اللقب', toastOptions);
      return;
    }
    if (!newSecretary.telephone) {
      toast.error('يرجى إدخال الهاتف', toastOptions);
      return;
    }
    if (!newSecretary.adresse) {
      toast.error('يرجى إدخال العنوان', toastOptions);
      return;
    }
    if (!newSecretary.ville) {
      toast.error('يرجى إدخال المدينة', toastOptions);
      return;
    }
    if (!newSecretary.email) {
      toast.error('يرجى إدخال البريد الإلكتروني', toastOptions);
      return;
    }
    if (!editingId && !newSecretary.password) {
      toast.error('يرجى إدخال كلمة المرور', toastOptions);
      return;
    }

    try {
      const payload = {
        nom: newSecretary.nom,
        prenom: newSecretary.prenom,
        telephone: newSecretary.telephone,
        adresse: newSecretary.adresse,
        ville: newSecretary.ville,
        email: newSecretary.email,
      };
      if (newSecretary.password) {
        payload.password = newSecretary.password;
      }

      let response;
      if (editingId) {
        response = await axios.put(`${API_URL}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecretaries(prev =>
          prev.map(s => (s._id === editingId ? response.data : s))
        );
        toast.success('تم تعديل السكرتير بنجاح', toastOptions);
      } else {
        response = await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecretaries(prev => [...prev, response.data]);
        toast.success('تمت إضافة السكرتير بنجاح', toastOptions);
      }
      handleModalClose();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
      } else {
        toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ السكرتير', toastOptions);
        console.error('Submit error:', err.response?.data || err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.', toastOptions);
      window.location.href = '/login';
      return;
    }

confirmToast('هل أنت متأكد من حذف هذا السكرتير؟', async () => {      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSecretaries(prev => prev.filter(s => s._id !== id));
        setSelectedSecretaries(prev => prev.filter(sid => sid !== id));
        toast.success('تم حذف السكرتير بنجاح', toastOptions);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
        } else {
          toast.error('فشل حذف السكرتير', toastOptions);
          console.error('Delete error:', err.response?.data || err.message);
        }
      }
    })
  };

  const handleShowDetails = (secretary) => {
    setSelectedSecretary(secretary);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedSecretary(null);
    setIsDetailsModalOpen(false);
  };

  if (loading) {
    return (
      <SecretaryContainer>
        <NavDash setToken={setToken} />
        <Sidebar setToken={setToken} />
        <MainContent>
          <SecretariesTable>
            <TableWrapper>
              <thead>
                <tr>
                  {headers.map(header => (
                    <TableHeader key={header.label}>{header.label}</TableHeader>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(5).fill().map((_, i) => (
                  <SkeletonRow key={i}>
                    {headers.map((_, j) => (
                      <SkeletonCell key={j} />
                    ))}
                  </SkeletonRow>
                ))}
              </tbody>
            </TableWrapper>
          </SecretariesTable>
        </MainContent>
      </SecretaryContainer>
    );
  }

  return (
    <SecretaryContainer>
      <NavDash setToken={setToken} />
      <Sidebar setToken={setToken} />
      <MainContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}
        <HeaderSection>
          <Title>إدارة السكرتارية</Title>
          <ButtonGroup>
            {selectedSecretaries.length > 0 && (
              <DeleteButton onClick={handleBulkDelete}>
                <FaTrash /> حذف المحدد ({selectedSecretaries.length})
              </DeleteButton>
            )}
            <ActionButton onClick={handleExport}>
              <FaDownload /> تحميل
            </ActionButton>
            <ActionButton onClick={() => handleModalOpen()}>
              <FaUser /> سكرتير جديد
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <FiltersSection>
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث بالاسم، اللقب، أو البريد الإلكتروني..."
            initialValue={searchTerm}
          />
        </FiltersSection>
        <SecretariesTable>
          <TableWrapper>
            <thead>
              <tr>
                {headers.map(header => (
                  <TableHeader
                    key={header.label}
                    onClick={() => handleSort(header.key)}
                  >
                    {header.label}
                    {sortConfig.key === header.key && (
                      <SortArrow>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </SortArrow>
                    )}
                  </TableHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSecretaries.map(row => (
                <TableRow key={row._id}>
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedSecretaries.includes(row._id)}
                      onChange={() => handleCheckboxChange(row._id)}
                    />
                  </TableCell>
                  <TableCell>{row.nom}</TableCell>
                  <TableCell>{row.prenom}</TableCell>
                  <TableCell>{row.telephone}</TableCell>
                  <TableCell>{row.adresse}</TableCell>
                  <TableCell>{row.ville}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <ActionIcons>
                      <ActionIcon
                        bgColor="#3b82f6"
                        hoverColor="#2563eb"
                        title="عرض"
                        onClick={() => handleShowDetails(row)}
                      >
                        <FaEye />
                      </ActionIcon>
                      <ActionIcon
                        bgColor={theme.primary}
                        hoverColor={theme.primaryDark}
                        onClick={() => handleModalOpen(row)}
                        title="تعديل"
                      >
                        <FaEdit />
                      </ActionIcon>
                      <ActionIcon
                        bgColor={theme.error}
                        hoverColor="#dc2626"
                        onClick={() => handleDelete(row._id)}
                        title="حذف"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </ActionIcons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </TableWrapper>
          {paginatedSecretaries.length === 0 && (
            <div className="text-center text-secondary p-6">
              {searchTerm
                ? `لا توجد نتائج مطابقة لـ "${searchTerm}"`
                : 'لا توجد بيانات'}
            </div>
          )}
        </SecretariesTable>
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            السابق
          </PageButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              active={currentPage === page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PageButton>
          ))}
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            التالي
          </PageButton>
        </Pagination>
        {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{editingId ? 'تعديل السكرتير' : 'إضافة سكرتير جديد'}</ModalTitle>
                <CloseButton onClick={handleModalClose}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>
              <ModalForm onSubmit={handleAddOrEditSecretary}>
                <FormField>
                  <FormLabel>الاسم *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="text"
                      name="nom"
                      value={newSecretary.nom}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaUser />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>اللقب *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="text"
                      name="prenom"
                      value={newSecretary.prenom}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaUser />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>الهاتف *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="tel"
                      name="telephone"
                      value={newSecretary.telephone}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaPhone />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>العنوان *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="text"
                      name="adresse"
                      value={newSecretary.adresse}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaMapMarkerAlt />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>المدينة *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="text"
                      name="ville"
                      value={newSecretary.ville}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaCity />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>البريد الإلكتروني *</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="email"
                      name="email"
                      value={newSecretary.email}
                      onChange={handleNewSecretaryChange}
                      required
                    />
                    <FormInputIcon>
                      <FaEnvelope />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <FormField>
                  <FormLabel>كلمة المرور {editingId ? '(اختياري)' : '*'}</FormLabel>
                  <FormInputWrapper>
                    <FormInput
                      type="password"
                      name="password"
                      value={newSecretary.password}
                      onChange={handleNewSecretaryChange}
                      required={!editingId}
                    />
                    <FormInputIcon>
                      <FaLock />
                    </FormInputIcon>
                  </FormInputWrapper>
                </FormField>
                <SubmitButton type="submit">
                  {editingId ? 'تعديل السكرتير' : 'إضافة السكرتير'}
                </SubmitButton>
              </ModalForm>
            </ModalContent>
          </ModalOverlay>
        )}
        {isDetailsModalOpen && selectedSecretary && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>تفاصيل السكرتير</ModalTitle>
                <CloseButton onClick={handleCloseDetails}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>
              <DetailsGrid>
                <div>
                  <DetailLabel>الاسم : </DetailLabel>
                  <DetailValue>{selectedSecretary.nom}</DetailValue>
                </div>
                <div>
                  <DetailLabel>اللقب : </DetailLabel>
                  <DetailValue>{selectedSecretary.prenom}</DetailValue>
                </div>
                <div>
                  <DetailLabel>الهاتف : </DetailLabel>
                  <DetailValue>{selectedSecretary.telephone}</DetailValue>
                </div>
                <div>
                  <DetailLabel>العنوان : </DetailLabel>
                  <DetailValue>{selectedSecretary.adresse}</DetailValue>
                </div>
                <div>
                  <DetailLabel>المدينة : </DetailLabel>
                  <DetailValue>{selectedSecretary.ville}</DetailValue>
                </div>
                <div>
                  <DetailLabel>البريد الإلكتروني : </DetailLabel>
                  <DetailValue>{selectedSecretary.email}</DetailValue>
                </div>
                <div>
                  <DetailLabel>المحامي : </DetailLabel>
                  <DetailValue>
                    {selectedSecretary.avocat_id
                      ? `${selectedSecretary.avocat_id.nom} ${selectedSecretary.avocat_id.prenom}`
                      : '-'}
                  </DetailValue>
                </div>
              </DetailsGrid>
              <CloseDetailsButton onClick={handleCloseDetails}>
                إغلاق
              </CloseDetailsButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>
    </SecretaryContainer>
  );
}

export default SecretaryManagement;