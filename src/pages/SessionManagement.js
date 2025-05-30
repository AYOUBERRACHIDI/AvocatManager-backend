import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaEye, FaEdit, FaTrash, FaDownload, FaTimes, FaFilePdf } from 'react-icons/fa';
import { SearchIcon, XCircleIcon } from 'lucide-react';
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
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
  info: '#3b82f6',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.background};
  direction: rtl;
  // font-family: 'Amiri', serif;
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
  font-weight: 700;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${theme.error};

  &:hover {
    background: #dc2626;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => (props.active ? theme.primary : theme.textSecondary)};
  background: ${props => (props.active ? `${theme.primary}10` : 'transparent')};
  border-bottom: ${props => (props.active ? `2px solid ${theme.primary}` : 'none')};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.primary};
    background: ${theme.primary}05;
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 1.5rem;
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterSelectWrapper = styled.div`
  flex: 1;
  min-width: 150px;
`;

const TableContainer = styled.div`
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${css`${fadeIn} 0.5s ease-out`};
  overflow-x: auto;
`;

const Table = styled.table`
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
  cursor: ${props => (props.sortable ? 'pointer' : 'default')};

  &:hover {
    background: ${props => (props.sortable ? `${theme.primary}20` : `${theme.primary}10`)};
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

const ModalOverlay = styled(motion.div)`
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

const ModalContent = styled(motion.div)`
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 2rem;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
  font-size: 1.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.error};
  }
`;

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: start;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.textPrimary};
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }

  &:invalid[required] {
    border-color: ${theme.error};
  }
`;

const FormSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem;
  background: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  grid-column: 1 / -1;
  margin-top: 1rem;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScheduleButton = styled(SubmitButton)`
  background: ${theme.info};

  &:hover {
    background: #2563eb;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${theme.error}10;
  color: ${theme.error};
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
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

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: ${theme.textSecondary};
`;

const DetailValue = styled.span`
  color: ${theme.textPrimary};
`;

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    padding: '0.25rem',
    borderRadius: '0.375rem',
    borderColor: '#d1d5db',
    fontSize: '0.875rem',
    direction: 'rtl',
    textAlign: 'right',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.primary,
    },
    boxShadow: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    marginTop: '0.25rem',
    zIndex: 1000,
    direction: 'rtl',
    textAlign: 'right',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? theme.primary : state.isFocused ? `${theme.primary}10` : 'white',
    color: state.isSelected ? 'white' : theme.textPrimary,
    direction: 'rtl',
    textAlign: 'right',
    '&:hover': {
      backgroundColor: state.isSelected ? theme.primary : `${theme.primary}10`,
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme.textPrimary,
    direction: 'rtl',
    textAlign: 'right',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: theme.textSecondary,
    direction: 'rtl',
    textAlign: 'right',
  }),
  input: (provided) => ({
    ...provided,
    direction: 'rtl',
    textAlign: 'right',
  }),
};

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
        aria-label="بحث الجلسات"
        maxLength={100}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <SearchIcon className="h-5 w-5 text-secondary" />
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

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/sessions';
const AFFAIRES_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires';
const CLIENTS_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/clients';
const CASE_TYPES_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires/types';

const TRIBUNALS = [
  { value: 'محكمة الابتدائية - الدار البيضاء', label: 'محكمة الابتدائية - الدار البيضاء' },
  { value: 'محكمة الابتدائية - الرباط', label: 'محكمة الابتدائية - الرباط' },
  { value: 'محكمة الابتدائية - فاس', label: 'محكمة الابتدائية - فاس' },
  { value: 'محكمة الابتدائية - مراكش', label: 'محكمة الابتدائية - مراكش' },
  { value: 'محكمة الاستئناف - الدار البيضاء', label: 'محكمة الاستئناف - الدار البيضاء' },
  { value: 'محكمة الاستئناف - الرباط', label: 'محكمة الاستئناف - الرباط' },
  { value: 'محكمة الاستئناف - فاس', label: 'محكمة الاستئناف - فاس' },
  { value: 'محكمة الاستئناف - مراكش', label: 'محكمة الاستئناف - مراكش' },
  { value: 'المحكمة الإدارية - الرباط', label: 'المحكمة الإدارية - الرباط' },
  { value: 'المحكمة التجارية - الدار البيضاء', label: 'المحكمة التجارية - الدار البيضاء' },
];

function SessionManagement({ setToken }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [caseTypes, setCaseTypes] = useState({});
  const [selectedTab, setSelectedTab] = useState('all');
  const [filters, setFilters] = useState({
    affaire: '',
    client: '',
  });
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSession, setNewSession] = useState({
    remarque: '',
    ordre: '',
    emplacement: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    client: '',
    status: 'pending',
    affaire_id: '',
    gouvernance: '',
    case_number: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const sessionsPerPage = 10;

  const clientOptions = useMemo(
    () => clients.map(client => ({ value: client.nom, label: client.nom })),
    [clients]
  );
  const clientFilterOptions = useMemo(
    () => [{ value: '', label: 'كل الموكلين' }, ...clients.map(client => ({ value: client._id, label: client.nom }))],
    [clients]
  );
  const affaireOptions = useMemo(
    () => [{ value: '', label: 'بدون ملف' }, ...cases.map(caseItem => ({ value: caseItem._id, label: caseItem.titre || caseItem.case_number }))],
    [cases]
  );
  const affaireFilterOptions = useMemo(
    () => [{ value: '', label: 'كل الملفات' }, ...cases.map(caseItem => ({ value: caseItem._id, label: caseItem.titre || caseItem.case_number }))],
    [cases]
  );

  const formatConflictMessage = (conflicts) => {
    return conflicts.map(conflict => {
      const startTime = new Date(conflict.start).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(conflict.end).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
      return `جلسة للعميل ${conflict.client} من ${startTime} إلى ${endTime}`;
    }).join('; ');
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
        toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        const [sessionsRes, casesRes, clientsRes, typesRes] = await Promise.all([
          axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(AFFAIRES_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(CLIENTS_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(CASE_TYPES_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setSessions(sessionsRes.data);
        setCases(casesRes.data);
        setClients(clientsRes.data);
        setCaseTypes(typesRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
          toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
        } else {
          setError('فشل جلب البيانات');
          toast.error('فشل جلب البيانات');
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

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (selectedTab !== 'all') {
      filtered = filtered.filter(session => {
        const affaire = cases.find(c => c._id === session.affaire_id?._id);
        return affaire?.category === selectedTab;
      });
    }

    if (filters.affaire) {
      filtered = filtered.filter(session => session.affaire_id?._id === filters.affaire);
    }

    if (filters.client) {
      filtered = filtered.filter(session => session.client_id === filters.client);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        session =>
          (session.remarque?.toLowerCase().includes(searchLower)) ||
          (session.emplacement?.toLowerCase().includes(searchLower)) ||
          (session.affaire_id?.titre?.toLowerCase().includes(searchLower)) ||
          (session.client?.toLowerCase().includes(searchLower)) ||
          (session.gouvernance?.toLowerCase().includes(searchLower)) ||
          (session.case_number?.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [sessions, cases, selectedTab, filters, searchTerm]);

  const sortedSessions = useMemo(() => {
    const sorted = [...filteredSessions].sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'client') {
        aValue = a.client || '-';
        bValue = b.client || '-';
      } else if (sortConfig.key === 'ordre') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [filteredSessions, sortConfig]);

  const totalPages = Math.ceil(sortedSessions.length / sessionsPerPage);
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

  const headers = [
    { label: '', key: '' },
    { label: 'رقم الملف', key: 'case_number' },
    { label: 'ملاحظة', key: 'remarque' },
    { label: 'الترتيب', key: 'ordre' },
    { label: 'الموقع', key: 'emplacement' },
    { label: 'الموكل', key: 'client' },
    { label: 'الحالة', key: 'status' },
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

  const handleFilterChange = (name, selectedOption) => {
    setFilters(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    setCurrentPage(1);
  };

  const handleExport = () => {
  const validHeaders = headers.filter(h => h.key);

  const exportData = filteredSessions.map(row => {
    const rowData = {};
    validHeaders.forEach(header => {
      rowData[header.label] = row[header.key] || '-';
    });
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `sessions_${new Date().toISOString().split('T')[0]}.xlsx`);

  toast.success('تم تحميل البيانات بنجاح');
};

  const handleCheckboxChange = (id) => {
    setSelectedSessions(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف الجلسات المحددة؟')) {
      try {
        setSubmitting(true);
        await Promise.all(
          selectedSessions.map(id =>
            axios.delete(`${API_URL}/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setSessions(prev => prev.filter(s => !selectedSessions.includes(s._id)));
        setSelectedSessions([]);
        setError(null);
        toast.success('تم حذف الجلسات المحددة بنجاح');
      } catch (err) {
        handleError(err, 'فشل حذف الجلسات');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAddSession = () => {
    setNewSession({
      remarque: '',
      ordre: '',
      emplacement: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      client: '',
      status: 'pending',
      affaire_id: '',
      gouvernance: '',
      case_number: '',
    });
    setEditingId(null);
    setError(null);
    setShowFormModal(true);
  };

  const handleEditSession = (session) => {
    setNewSession({
      remarque: session.remarque || '',
      ordre: session.ordre || '',
      emplacement: session.emplacement || '',
      date: session.start instanceof Date ? session.start.toISOString().split('T')[0] : new Date(session.start).toISOString().split('T')[0],
      heure_debut: session.heure_debut || (session.start instanceof Date ? session.start.toTimeString().slice(0, 5) : new Date(session.start).toTimeString().slice(0, 5)),
      heure_fin: session.heure_fin || (session.end instanceof Date ? session.end.toTimeString().slice(0, 5) : new Date(session.end).toTimeString().slice(0, 5)),
      client: session.client || '',
      status: session.status || 'pending',
      affaire_id: session.affaire_id?._id || '',
      gouvernance: session.gouvernance || '',
      case_number: session.case_number || '',
    });
    setEditingId(session._id);
    setError(null);
    setShowFormModal(true);
  };

  const handleFormModalClose = () => {
    setShowFormModal(false);
    setNewSession({
      remarque: '',
      ordre: '',
      emplacement: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      client: '',
      status: 'pending',
      affaire_id: '',
      gouvernance: '',
      case_number: '',
    });
    setEditingId(null);
    setError(null);
  };

  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
    setNewSession({
      remarque: '',
      ordre: '',
      emplacement: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      client: '',
      status: 'pending',
      affaire_id: '',
      gouvernance: '',
      case_number: '',
    });
    setError(null);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedSession(null);
  };

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({
      ...prev,
      [name]: name === 'ordre' ? parseInt(value) || '' : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setNewSession(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : '',
    }));
  };

  const validateSession = () => {
    if (!newSession.ordre) {
      setError('يرجى إدخال الترتيب');
      toast.error('يرجى إدخال الترتيب');
      return false;
    }
    if (!newSession.emplacement) {
      setError('يرجى اختيار الموقع');
      toast.error('يرجى اختيار الموقع');
      return false;
    }
    if (!newSession.date) {
      setError('يرجى إدخال التاريخ');
      toast.error('يرجى إدخال التاريخ');
      return false;
    }
    if (!newSession.heure_debut || !newSession.heure_fin) {
      setError('يرجى إدخال وقت البدء والانتهاء');
      toast.error('يرجى إدخال وقت البدء والانتهاء');
      return false;
    }
    if (!newSession.client) {
      setError('يرجى اختيار الموكل');
      toast.error('يرجى اختيار الموكل');
      return false;
    }
    return true;
  };

  const handleError = (err, defaultMessage) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      setToken(null);
      window.location.href = '/login';
      setError('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
    } else if (err.response?.data?.message === 'تضارب في موعد الجلسة مع جلسات أخرى') {
      const conflicts = err.response.data.conflicts;
      const conflictMessage = `تعارض في المواعيد: ${formatConflictMessage(conflicts)}`;
      setError(conflictMessage);
      toast.error(conflictMessage);
    } else {
      const errorMessage = err.response?.data?.message || defaultMessage;
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error:', err.response?.data || err.message);
    }
  };

  const handleAddSessionSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!validateSession()) return;

    try {
      setSubmitting(true);
      const payload = {
        remarque: newSession.remarque,
        ordre: newSession.ordre,
        emplacement: newSession.emplacement,
        date: newSession.date,
        heure_debut: newSession.heure_debut,
        heure_fin: newSession.heure_fin,
        client: newSession.client,
        status: newSession.status,
        affaire_id: newSession.affaire_id || null,
        gouvernance: newSession.gouvernance || '',
        case_number: newSession.case_number || '',
      };

      const response = await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(prev => [...prev, response.data]);
      handleFormModalClose();
      setError(null);
      toast.success('تم إضافة الجلسة بنجاح');
    } catch (err) {
      handleError(err, 'حدث خطأ أثناء إضافة الجلسة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSessionSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!validateSession()) return;

    try {
      setSubmitting(true);
      const payload = {
        remarque: newSession.remarque,
        ordre: newSession.ordre,
        emplacement: newSession.emplacement,
        date: newSession.date,
        heure_debut: newSession.heure_debut,
        heure_fin: newSession.heure_fin,
        client: newSession.client,
        status: newSession.status,
        affaire_id: newSession.affaire_id || null,
        gouvernance: newSession.gouvernance || '',
        case_number: newSession.case_number || '',
      };

      const response = await axios.put(`${API_URL}/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(prev =>
        prev.map(s => (s._id === editingId ? response.data : s))
      );
      handleFormModalClose();
      setError(null);
      toast.success('تم تعديل الجلسة بنجاح');
    } catch (err) {
      handleError(err, 'حدث خطأ أثناء تعديل الجلسة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSchedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!validateSession()) return;

    try {
      setSubmitting(true);
      const payload = {
        remarque: newSession.remarque,
        ordre: newSession.ordre,
        emplacement: newSession.emplacement,
        date: newSession.date,
        heure_debut: newSession.heure_debut,
        heure_fin: newSession.heure_fin,
        client: newSession.client,
        status: newSession.status,
        affaire_id: newSession.affaire_id || null,
        gouvernance: newSession.gouvernance || '',
        case_number: newSession.case_number || '',
      };

      const response = await axios.put(`${API_URL}/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(prev =>
        prev.map(s => (s._id === editingId ? response.data : s))
      );
      setShowFormModal(false);
      setShowScheduleModal(true);
      setError(null);
      toast.success('تم تعديل الجلسة، يمكنك الآن برمجة جلسة جديدة');
    } catch (err) {
      handleError(err, 'حدث خطأ أثناء تعديل الجلسة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSessionSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!validateSession()) return;

    try {
      setSubmitting(true);
      const payload = {
        remarque: newSession.remarque,
        ordre: newSession.ordre,
        emplacement: newSession.emplacement,
        date: newSession.date,
        heure_debut: newSession.heure_debut,
        heure_fin: newSession.heure_fin,
        client: newSession.client,
        status: newSession.status,
        affaire_id: newSession.affaire_id || null,
        gouvernance: newSession.gouvernance || '',
        case_number: newSession.case_number || '',
      };

      const response = await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(prev => [...prev, response.data]);
      handleScheduleModalClose();
      setError(null);
      toast.success('تم إضافة الجلسة الجديدة بنجاح');
    } catch (err) {
      handleError(err, 'حدث خطأ أثناء إضافة الجلسة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      try {
        setSubmitting(true);
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(prev => prev.filter(s => s._id !== id));
        setSelectedSessions(prev => prev.filter(sid => sid !== id));
        setError(null);
        toast.success('تم حذف الجلسة بنجاح');
      } catch (err) {
        handleError(err, 'فشل حذف الجلسة');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleShowDetails = (session) => {
    setSelectedSession({
      ...session,
      start: session.start instanceof Date ? session.start : new Date(session.start),
      end: session.end instanceof Date ? session.end : new Date(session.end),
    });
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
      window.location.href = '/login';
      return;
    }

    if (!id || typeof id !== 'string') {
      setError('معرف الجلسة غير صالح');
      toast.error('معرف الجلسة غير صالح');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.get(`${API_URL}/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      if (response.headers['content-type'] !== 'application/pdf') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'فشل تحميل ملف PDF');
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setError(null);
      toast.success('تم تحميل ملف PDF بنجاح');
    } catch (err) {
      handleError(err, 'فشل تحميل ملف PDF');
    } finally {
      setSubmitting(false);
    }
  };

  const tabLabels = {
    all: 'الكل',
    civil: 'مدني',
    criminal: 'جنائي',
    commercial: 'تجاري',
    administrative: 'إداري',
    family: 'أسري',
    labor: 'عمالي',
  };

  if (loading) {
    return (
      <Container>
        <NavDash setToken={setToken} />
        <Sidebar setToken={setToken} />
        <MainContent>
          <TableContainer>
            <Table>
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
            </Table>
          </TableContainer>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <NavDash setToken={setToken} />
      <Sidebar setToken={setToken} />
      <MainContent>
        <HeaderSection>
          <Title>إدارة الجلسات</Title>
          <ButtonGroup>
            {selectedSessions.length > 0 && (
              <DeleteButton onClick={handleBulkDelete} disabled={submitting}>
                <FaTrash /> حذف المحدد ({selectedSessions.length})
              </DeleteButton>
            )}
            <ActionButton onClick={handleExport} disabled={submitting}>
              <FaDownload /> تحميل
            </ActionButton>
            <ActionButton onClick={handleAddSession} disabled={submitting}>
              + جلسة جديدة
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <TabsContainer>
          {['all', ...Object.keys(caseTypes)].map(tab => (
            <Tab
              key={tab}
              active={selectedTab === tab}
              onClick={() => {
                setSelectedTab(tab);
                setCurrentPage(1);
              }}
            >
              {tabLabels[tab] || tab}
            </Tab>
          ))}
        </TabsContainer>
        <FiltersSection>
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث بالملاحظة، الموقع، الموكل، أو الملف..."
            initialValue={searchTerm}
            className="flex-1 min-w-[200px]"
          />
          <FilterSelectWrapper>
            <Select
              options={clientFilterOptions}
              value={clientFilterOptions.find(option => option.value === filters.client)}
              onChange={(selected) => handleFilterChange('client', selected)}
              placeholder="اختر الموكل"
              styles={customSelectStyles}
              isClearable
            />
          </FilterSelectWrapper>
          <FilterSelectWrapper>
            <Select
              options={affaireFilterOptions}
              value={affaireFilterOptions.find(option => option.value === filters.affaire)}
              onChange={(selected) => handleFilterChange('affaire', selected)}
              placeholder="اختر الملف"
              styles={customSelectStyles}
              isClearable
            />
          </FilterSelectWrapper>
        </FiltersSection>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </ErrorMessage>
        )}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                {headers.map(header => (
                  <TableHeader
                    key={header.label}
                    onClick={() => handleSort(header.key)}
                    sortable={header.key !== ''}
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
              {paginatedSessions.map(row => (
                <TableRow key={row._id}>
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedSessions.includes(row._id)}
                      onChange={() => handleCheckboxChange(row._id)}
                      disabled={submitting}
                    />
                  </TableCell>
                  <TableCell>{row.case_number || '-'}</TableCell>
                  <TableCell>{row.remarque || '-'}</TableCell>
                  <TableCell>{row.ordre}</TableCell>
                  <TableCell>{row.emplacement}</TableCell>
                  <TableCell>{row.client || '-'}</TableCell>
                  <TableCell>{row.status === 'pending' ? 'معلق' : row.status === 'confirmed' ? 'مؤكد' : 'ملغى'}</TableCell>
                  <TableCell>
                    <ActionIcons>
                      <ActionIcon
                        bgColor="#3b82f6"
                        hoverColor="#2563eb"
                        title="عرض"
                        onClick={() => handleShowDetails(row)}
                        disabled={submitting}
                      >
                        <FaEye />
                      </ActionIcon>
                      <ActionIcon
                        bgColor={theme.primary}
                        hoverColor={theme.primaryDark}
                        onClick={() => handleEditSession(row)}
                        title="تعديل"
                        disabled={submitting}
                      >
                        <FaEdit />
                      </ActionIcon>
                      <ActionIcon
                        bgColor={theme.error}
                        hoverColor="#dc2626"
                        onClick={() => handleDelete(row._id)}
                        title="حذف"
                        disabled={submitting}
                      >
                        <FaTrash />
                      </ActionIcon>
                      <ActionIcon
                        bgColor="#d97706"
                        hoverColor="#b45309"
                        onClick={() => handleDownloadPDF(row._id)}
                        title="تحميل PDF"
                        disabled={submitting}
                      >
                        <FaFilePdf />
                      </ActionIcon>
                    </ActionIcons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          {paginatedSessions.length === 0 && (
            <div className="text-center text-secondary p-6">
              {searchTerm
                ? `لا توجد نتائج مطابقة لـ "${searchTerm}"`
                : selectedTab !== 'all'
                ? `لا توجد جلسات في فئة "${tabLabels[selectedTab]}"`
                : 'لا توجد جلسات'}
            </div>
          )}
        </TableContainer>
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || submitting}
          >
            السابق
          </PageButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              active={currentPage === page}
              onClick={() => setCurrentPage(page)}
              disabled={submitting}
            >
              {page}
            </PageButton>
          ))}
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || submitting}
          >
            التالي
          </PageButton>
        </Pagination>
        <AnimatePresence>
          {showDetailsModal && selectedSession && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModalContent
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ModalHeader>
                  <ModalTitle>تفاصيل الجلسة</ModalTitle>
                  <CloseButton onClick={handleDetailsModalClose}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                <DetailItem>
                  <DetailLabel>رقم الملف</DetailLabel>
                  <DetailValue>{selectedSession.case_number || '-'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>ملاحظة</DetailLabel>
                  <DetailValue>{selectedSession.remarque || '-'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>الترتيب</DetailLabel>
                  <DetailValue>{selectedSession.ordre}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>الموقع</DetailLabel>
                  <DetailValue>{selectedSession.emplacement}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>الموكل</DetailLabel>
                  <DetailValue>{selectedSession.client || '-'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>التاريخ</DetailLabel>
                  <DetailValue>{(selectedSession.start instanceof Date ? selectedSession.start : new Date(selectedSession.start)).toLocaleDateString('ar')}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>وقت البدء</DetailLabel>
                  <DetailValue>{selectedSession.heure_debut || (selectedSession.start instanceof Date ? selectedSession.start.toTimeString().slice(0, 5) : new Date(selectedSession.start).toTimeString().slice(0, 5))}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>وقت الانتهاء</DetailLabel>
                  <DetailValue>{selectedSession.heure_fin || (selectedSession.end instanceof Date ? selectedSession.end.toTimeString().slice(0, 5) : new Date(selectedSession.end).toTimeString().slice(0, 5))}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>الحالة</DetailLabel>
                  <DetailValue>{selectedSession.status === 'pending' ? 'معلق' : selectedSession.status === 'confirmed' ? 'مؤكد' : 'ملغى'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>الحوكمة</DetailLabel>
                  <DetailValue>{selectedSession.gouvernance || '-'}</DetailValue>
                </DetailItem>
              </ModalContent>
            </ModalOverlay>
          )}
          {showFormModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModalContent
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ModalHeader>
                  <ModalTitle>{editingId ? 'تعديل الجلسة' : 'إضافة جلسة جديدة'}</ModalTitle>
                  <CloseButton onClick={handleFormModalClose}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </ErrorMessage>
                )}
                <ModalForm onSubmit={editingId ? handleEditSessionSubmit : handleAddSessionSubmit}>
                  <FormField>
                    <FormLabel>الترتيب *</FormLabel>
                    <FormInput
                      type="number"
                      name="ordre"
                      value={newSession.ordre}
                      onChange={handleNewSessionChange}
                      required
                      min="0"
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الموقع *</FormLabel>
                    <Select
                      options={TRIBUNALS}
                      value={TRIBUNALS.find(option => option.value === newSession.emplacement)}
                      onChange={(selected) => handleSelectChange('emplacement', selected)}
                      placeholder="اختر المحكمة"
                      styles={customSelectStyles}
                      required
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>التاريخ *</FormLabel>
                    <FormInput
                      type="date"
                      name="date"
                      value={newSession.date}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الموكل *</FormLabel>
                    <Select
                      options={clientOptions}
                      value={clientOptions.find(option => option.value === newSession.client)}
                      onChange={(selected) => handleSelectChange('client', selected)}
                      placeholder="اختر الموكل"
                      styles={customSelectStyles}
                      required
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الملف</FormLabel>
                    <Select
                      options={affaireOptions}
                      value={affaireOptions.find(option => option.value === newSession.affaire_id)}
                      onChange={(selected) => handleSelectChange('affaire_id', selected)}
                      placeholder="اختر الملف"
                      styles={customSelectStyles}
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الحالة</FormLabel>
                    <FormSelect
                      name="status"
                      value={newSession.status}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    >
                      <option value="pending">معلق</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="cancelled">ملغى</option>
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>الحوكمة</FormLabel>
                    <FormInput
                      type="text"
                      name="gouvernance"
                      value={newSession.gouvernance}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>ملاحظة</FormLabel>
                    <FormTextarea
                      name="remarque"
                      value={newSession.remarque}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>وقت البدء *</FormLabel>
                    <FormInput
                      type="time"
                      name="heure_debut"
                      value={newSession.heure_debut}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>وقت الانتهاء *</FormLabel>
                    <FormInput
                      type="time"
                      name="heure_fin"
                      value={newSession.heure_fin}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  {editingId ? (
                    <>
                      <SubmitButton type="submit" disabled={submitting}>
                        {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                      </SubmitButton>
                      <ScheduleButton type="button" onClick={handleSaveAndSchedule} disabled={submitting}>
                        {submitting ? 'جارٍ الحفظ...' : 'حفظ وبرمجة جلسة'}
                      </ScheduleButton>
                    </>
                  ) : (
                    <SubmitButton type="submit" disabled={submitting}>
                      {submitting ? 'جارٍ الإضافة...' : 'إضافة الجلسة'}
                    </SubmitButton>
                  )}
                </ModalForm>
              </ModalContent>
            </ModalOverlay>
          )}
          {showScheduleModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ModalContent
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ModalHeader>
                  <ModalTitle>برمجة جلسة جديدة</ModalTitle>
                  <CloseButton onClick={handleScheduleModalClose}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </ErrorMessage>
                )}
                <ModalForm onSubmit={handleScheduleSessionSubmit}>
                  <FormField>
                    <FormLabel>الترتيب *</FormLabel>
                    <FormInput
                      type="number"
                      name="ordre"
                      value={newSession.ordre}
                      onChange={handleNewSessionChange}
                      required
                      min="0"
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الموقع *</FormLabel>
                    <Select
                      options={TRIBUNALS}
                      value={TRIBUNALS.find(option => option.value === newSession.emplacement)}
                      onChange={(selected) => handleSelectChange('emplacement', selected)}
                      placeholder="اختر المحكمة"
                      styles={customSelectStyles}
                      required
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>التاريخ *</FormLabel>
                    <FormInput
                      type="date"
                      name="date"
                      value={newSession.date}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الموكل *</FormLabel>
                    <Select
                      options={clientOptions}
                      value={clientOptions.find(option => option.value === newSession.client)}
                      onChange={(selected) => handleSelectChange('client', selected)}
                      placeholder="اختر الموكل"
                      styles={customSelectStyles}
                      required
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الملف</FormLabel>
                    <Select
                      options={affaireOptions}
                      value={affaireOptions.find(option => option.value === newSession.affaire_id)}
                      onChange={(selected) => handleSelectChange('affaire_id', selected)}
                      placeholder="اختر الملف"
                      styles={customSelectStyles}
                      isClearable
                      isDisabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>الحالة</FormLabel>
                    <FormSelect
                      name="status"
                      value={newSession.status}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    >
                      <option value="pending">معلق</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="cancelled">ملغى</option>
                    </FormSelect>
                  </FormField>
                  <FormField>
                    <FormLabel>الحوكمة</FormLabel>
                    <FormInput
                      type="text"
                      name="gouvernance"
                      value={newSession.gouvernance}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>ملاحظة</FormLabel>
                    <FormTextarea
                      name="remarque"
                      value={newSession.remarque}
                      onChange={handleNewSessionChange}
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>وقت البدء *</FormLabel>
                    <FormInput
                      type="time"
                      name="heure_debut"
                      value={newSession.heure_debut}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>وقت الانتهاء *</FormLabel>
                    <FormInput
                      type="time"
                      name="heure_fin"
                      value={newSession.heure_fin}
                      onChange={handleNewSessionChange}
                      required
                      disabled={submitting}
                    />
                  </FormField>
                  <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? 'جارٍ الإضافة...' : 'إضافة الجلسة'}
                  </SubmitButton>
                </ModalForm>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
      </MainContent>
    </Container>
  );
}

export default SessionManagement;