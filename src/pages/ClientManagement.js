import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaEye, FaEdit, FaTrash, FaDownload, FaTimes } from 'react-icons/fa';
import { GlassesIcon as MagnifyingGlassIcon, XCircleIcon } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom/client';
import { toast, Toaster } from 'react-hot-toast';
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

const ClientContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.background};
  direction: rtl;
  // font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;
const ToastOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px); /* Flou plus prononcé pour l'arrière-plan */
  -webkit-backdrop-filter: blur(8px); /* Support pour Safari */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Plus haut que ModalOverlay (z-index: 1000) */
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
const MainContent = styled.div`
  flex: 1;
  margin-right: 70px;
  margin-top: 60px;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-right: 0;
    padding: 1.5rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.textPrimary};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    right: 0;
    width: 3rem;
    height: 4px;
    background: ${theme.primary};
    border-radius: 2px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${theme.error};

  &:hover {
    background: #dc2626;
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ClientsTable = styled.div`
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1.5rem;
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
  padding: 1rem 1.5rem;
  background: ${theme.primary}10;
  color: ${theme.textPrimary};
  font-weight: 600;
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
  padding: 1rem 1.5rem;
  color: ${theme.textPrimary};
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionIcon = styled.button`
  padding: 0.5rem;
  background: ${props => props.bgColor};
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => props.hoverColor};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:hover:after {
    content: attr(title);
    position: absolute;
    top: -2.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.textPrimary};
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const Checkbox = styled.input`
  accent-color: ${theme.primary};
  width: 1.25rem;
  height: 1.25rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${props => (props.active ? theme.primary : 'white')};
  color: ${props => (props.active ? 'white' : theme.textPrimary)};
  border: 1px solid ${props => (props.active ? theme.primary : '#d1d5db')};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => (props.active ? theme.primaryDark : '#f3f4f6')};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${theme.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  color: ${theme.textSecondary};
  font-size: 1.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${theme.textPrimary};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.textPrimary};
`;

const FormInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.primary};
  }

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
  padding: 0.75rem;
  background: ${theme.primary};
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
  margin: 1rem auto 0;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SkeletonRow = styled.tr`
  height: 3.5rem;
`;

const SkeletonCell = styled.td`
  padding: 1rem 1.5rem;
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

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: ${theme.textPrimary};
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
        className="w-full py-3 px-4 pl-12 pr-12 bg-white rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-secondary text-right dir-rtl"
        dir="rtl"
        aria-label="بحث الموكلين"
        maxLength={100}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-secondary" />
      </div>
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 left-0 flex items-center pl-4 hover:text-error"
          aria-label="Clear search"
        >
          <XCircleIcon className="h-5 w-5 text-secondary hover:text-error" />
        </button>
      )}
    </div>
  );
};

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/clients';

function ClientManagement({ setToken }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newClient, setNewClient] = useState({
    nom: '',
    CIN: '',
    telephone_1: '',
    telephone_2: '',
    adresse_1: '',
    adresse_2: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const clientsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
        } else {
          setError('فشل جلب البيانات');
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

  const filteredClients = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return clients.filter(
      client =>
        client.nom.toLowerCase().includes(searchLower) ||
        client.CIN.toLowerCase().includes(searchLower) ||
        client.telephone_1.toLowerCase().includes(searchLower) ||
        client.adresse_1.toLowerCase().includes(searchLower)
    );
  }, [clients, searchTerm]);

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = sortConfig.key === 'totalAffairs' ? (a.totalAffairs || 0) : (a[sortConfig.key] || '');
    const bValue = sortConfig.key === 'totalAffairs' ? (b.totalAffairs || 0) : (b[sortConfig.key] || '');
    if (sortConfig.key === 'totalAffairs') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const totalPages = Math.ceil(sortedClients.length / clientsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage
  );

  const headers = [
    { label: '', key: '' },
    { label: 'الاسم', key: 'nom' },
    { label: 'رقم الهوية', key: 'CIN' },
    { label: 'الهاتف الأول', key: 'telephone_1' },
    { label: 'العنوان الأول', key: 'adresse_1' },
    { label: 'عدد الملفات', key: 'totalAffairs' },
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
const confirmToast = (message, onConfirm) => {
  const toastRoot = document.createElement('div');
  document.body.appendChild(toastRoot);

  const root = ReactDOM.createRoot(toastRoot); 

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleClose = () => {
    root.unmount(); 
    document.body.removeChild(toastRoot);
  };

  const ToastComponent = () => (
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
  );

  root.render(<ToastComponent />);
};

  const handleExport = () => {
  try {
    const exportHeaders = [
      'الاسم',
      'رقم الهوية',
      'الهاتف الأول',
      'الهاتف الثاني',
      'العنوان الأول',
      'العنوان الثاني',
      'عدد الملفات',
    ];

    const data = clients.map((row) => ({
      'الاسم': row.nom || '',
      'رقم الهوية': row.CIN || '',
      'الهاتف الأول': row.telephone_1 || '',
      'الهاتف الثاني': row.telephone_2 || '',
      'العنوان الأول': row.adresse_1 || '',
      'العنوان الثاني': row.adresse_2 || '',
      'عدد الملفات': row.totalAffairs || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data, { header: exportHeaders });

    ws['!cols'] = exportHeaders.map(() => ({ wch: 20 }));

    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(file, `clients_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('تم تحميل الملف بنجاح');
  } catch (error) {
    console.error('Error exporting XLSX:', error);
    toast.error('فشل تحميل الملف');
  }
};

  const handleCheckboxChange = (id) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

const handleBulkDelete = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
    window.location.href = '/login';
    return;
  }

  confirmToast('هل أنت متأكد من حذف الموكلين المحددين؟', async () => {
    try {
      await Promise.all(
        selectedClients.map(id =>
          axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setClients(prev => prev.filter(c => !selectedClients.includes(c._id)));
      setSelectedClients([]);
      setError(null);
      toast.success('تم حذف الموكلين المحددين بنجاح', {
        style: {
          background: '#fff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: "'Amiri', 'Noto Sans Arabic', sans-serif",
        },
        position: 'center',
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      } else {
        setError('فشل حذف الموكلين');
        toast.error('فشل حذف الموكلين', {
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Amiri', 'Noto Sans Arabic', sans-serif",
          },
          position: 'center',
        });
      }
    }
  });
};

  const handleModalOpen = (client = null) => {
    if (client) {
      setNewClient({
        nom: client.nom,
        CIN: client.CIN,
        telephone_1: client.telephone_1,
        telephone_2: client.telephone_2 || '',
        adresse_1: client.adresse_1,
        adresse_2: client.adresse_2 || '',
      });
      setEditingId(client._id);
    } else {
      setNewClient({
        nom: '',
        CIN: '',
        telephone_1: '',
        telephone_2: '',
        adresse_1: '',
        adresse_2: '',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewClient({
      nom: '',
      CIN: '',
      telephone_1: '',
      telephone_2: '',
      adresse_1: '',
      adresse_2: '',
    });
    setEditingId(null);
    setError(null);
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrEditClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!newClient.nom || !newClient.CIN || !newClient.telephone_1 || !newClient.adresse_1) {
      setError('الحقول المطلوبة: الاسم، رقم الهوية، الهاتف الأول، العنوان الأول');
      return;
    }

    try {
      let response;
      const clientData = { ...newClient };
      if (editingId) {
        response = await axios.put(`${API_URL}/${editingId}`, clientData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(prev =>
          prev.map(c => (c._id === editingId ? response.data : c))
        );
      } else {
        response = await axios.post(API_URL, clientData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(prev => [...prev, response.data]);
      }
      handleModalClose();
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      } else {
        setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الموكل');
        console.error('Submit error:', err.response?.data || err.message);
      }
    }
  };

const handleDelete = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
    window.location.href = '/login';
    return;
  }

  confirmToast('هل أنت متأكد من حذف هذا الموكل؟', async () => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(prev => prev.filter(c => c._id !== id));
      setSelectedClients(prev => prev.filter(cid => cid !== id));
      setError(null);
      toast.success('تم حذف الموكل بنجاح', {
        style: {
          background: '#fff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: "'Amiri', 'Noto Sans Arabic', sans-serif",
        },
        position: 'center',
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      } else {
        setError('فشل حذف الموكل');
        toast.error('فشل حذف الموكل', {
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Amiri', 'Noto Sans Arabic', sans-serif",
          },
          position: 'center',
        });
      }
    }
  });
};

  const handleShowDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedClient(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <ClientContainer>
        <NavDash setToken={setToken} />
        <Sidebar setToken={setToken} />
        <MainContent>
          <ClientsTable>
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
          </ClientsTable>
        </MainContent>
      </ClientContainer>
    );
  }

  return (
    <ClientContainer>
      <NavDash setToken={setToken} />
      <Sidebar setToken={setToken} />
      <MainContent>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg shadow-sm flex justify-between items-center border border-red-200"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </motion.div>
        )}
        <HeaderSection>
          <Title>إدارة الموكلين</Title>
          <ButtonGroup>
            {selectedClients.length > 0 && (
              <DeleteButton onClick={handleBulkDelete}>
                <FaTrash /> حذف المحدد ({selectedClients.length})
              </DeleteButton>
            )}
            <ActionButton onClick={handleExport}>
              <FaDownload /> تحميل
            </ActionButton>
            <ActionButton onClick={() => handleModalOpen()}>
              + موكل جديد
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <FiltersSection>
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث بالاسم، رقم الهوية، الهاتف، أو العنوان..."
            initialValue={searchTerm}
          />
        </FiltersSection>
        <ClientsTable>
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
              {paginatedClients.map(row => (
                <motion.tr
                  key={row._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedClients.includes(row._id)}
                      onChange={() => handleCheckboxChange(row._id)}
                    />
                  </TableCell>
                  <TableCell>{row.nom}</TableCell>
                  <TableCell>{row.CIN}</TableCell>
                  <TableCell>{row.telephone_1}</TableCell>
                  <TableCell>{row.adresse_1}</TableCell>
                  <TableCell>{row.totalAffairs || 0}</TableCell>
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
                </motion.tr>
              ))}
            </tbody>
          </TableWrapper>
          {paginatedClients.length === 0 && (
            <div className="text-center text-secondary p-6">
              {searchTerm
                ? `لا توجد نتائج مطابقة لـ "${searchTerm}"`
                : 'لا توجد بيانات'}
            </div>
          )}
        </ClientsTable>
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
        <AnimatePresence>
          {isModalOpen && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleModalClose}
            >
              <ModalContent
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>{editingId ? 'تعديل الموكل' : 'إضافة موكل جديد'}</ModalTitle>
                  <CloseButton onClick={handleModalClose}>
                    <FaTimes className="h-6 w-6" />
                  </CloseButton>
                </ModalHeader>
                <ModalForm onSubmit={handleAddOrEditClient}>
                  <FormGrid>
                    <FormField>
                      <FormLabel>الاسم *</FormLabel>
                      <FormInput
                        type="text"
                        name="nom"
                        value={newClient.nom}
                        onChange={handleNewClientChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>رقم الهوية *</FormLabel>
                      <FormInput
                        type="text"
                        name="CIN"
                        value={newClient.CIN}
                        onChange={handleNewClientChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>الهاتف الأول *</FormLabel>
                      <FormInput
                        type="tel"
                        name="telephone_1"
                        value={newClient.telephone_1}
                        onChange={handleNewClientChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>الهاتف الثاني</FormLabel>
                      <FormInput
                        type="tel"
                        name="telephone_2"
                        value={newClient.telephone_2}
                        onChange={handleNewClientChange}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>العنوان الأول *</FormLabel>
                      <FormInput
                        type="text"
                        name="adresse_1"
                        value={newClient.adresse_1}
                        onChange={handleNewClientChange}
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>العنوان الثاني</FormLabel>
                      <FormInput
                        type="text"
                        name="adresse_2"
                        value={newClient.adresse_2}
                        onChange={handleNewClientChange}
                      />
                    </FormField>
                  </FormGrid>
                  <SubmitButton type="submit">
                    {editingId ? 'تعديل الموكل' : 'إضافة الموكل'}
                  </SubmitButton>
                </ModalForm>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDetailsModal && selectedClient && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseDetails}
            >
              <ModalContent
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>تفاصيل الموكل</ModalTitle>
                  <CloseButton onClick={handleCloseDetails}>
                    <FaTimes className="h-6 w-6" />
                  </CloseButton>
                </ModalHeader>
                <ModalGrid>
                  <div className="space-y-6">
                    <DetailItem>
                      <DetailLabel>الاسم</DetailLabel>
                      <DetailValue>{selectedClient.nom}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>رقم الهوية</DetailLabel>
                      <DetailValue>{selectedClient.CIN}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>الهاتف الأول</DetailLabel>
                      <DetailValue>{selectedClient.telephone_1}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>عدد الملفات</DetailLabel>
                      <DetailValue>{selectedClient.totalAffairs || 0}</DetailValue>
                    </DetailItem>
                  </div>
                  <div className="space-y-6">
                    <DetailItem>
                      <DetailLabel>الهاتف الثاني</DetailLabel>
                      <DetailValue>{selectedClient.telephone_2 || '-'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>العنوان الأول</DetailLabel>
                      <DetailValue>{selectedClient.adresse_1}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>العنوان الثاني</DetailLabel>
                      <DetailValue>{selectedClient.adresse_2 || '-'}</DetailValue>
                    </DetailItem>
                  </div>
                </ModalGrid>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </MainContent>
    </ClientContainer>
  );
}

export default ClientManagement;