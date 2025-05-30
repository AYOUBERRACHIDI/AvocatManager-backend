import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
import { FaEye, FaEdit, FaTrash, FaDownload, FaTimes } from 'react-icons/fa';
import { GlassesIcon as MagnifyingGlassIcon, XCircleIcon, FileText } from 'lucide-react';
import { debounce } from 'lodash';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const theme = {
  primary: '#2e7d32',
  primaryDark: '#059669',
  secondary: '#6b7280',
  background: '#f9fafb',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  error: '#ef4444',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PaymentContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.background};
  direction: rtl;
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
  font-weight: 600;
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

const SummarySection = styled.div`
  margin-bottom: 2rem;
  display:Hannah: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const SummaryCard = styled(motion.div)`
  background: ${theme.cardBackground};
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
`;

const SummaryIconWrapper = styled.div`
  padding: 0.75rem;
  background: ${props => props.bgColor};
  border-radius: 9999px;
`;

const SummaryText = styled.div`
  flex: 1;
`;

const SummaryTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.textSecondary};
`;

const SummaryValue = styled.p`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${theme.textPrimary};
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background: ${theme.cardBackground};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  border: 1px solid #e5e7eb;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 160px;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const DatePicker = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 160px;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const PaymentsTable = styled.div`
  background: ${theme.cardBackground};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${css`${fadeIn} 0.5s ease-out`};
  overflow-x: auto;
  border: 1px solid #e5e7eb;
`;

const TableWrapper = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
`;

const TableHeader = styled.th`
  padding: 1rem 1.5rem;
  background: ${theme.primary}05;
  color: ${theme.textPrimary};
  font-weight: 600;
  text-align: right;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.3s ease;

  &:hover {
    background: ${theme.primary}10;
  }
`;

const TableRow = styled.tr`
  transition: background 0.3s ease;

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
  border-radius: 0.5rem;
  font-size: 0.9rem;
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
    padding: 0.35rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const Checkbox = styled.input`
  accent-color: ${theme.primary};
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${props => (props.active ? theme.primary : 'white')};
  color: ${props => (props.active ? 'white' : theme.textPrimary)};
  border: 1px solid ${props => (props.active ? theme.primary : '#d1d5db')};
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
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
  font-size: 0.9rem;
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

const Receipt = styled.div`
  position: absolute;
  left: -9999px;
  width: 180mm;
  min-height: 260mm;
  padding: 20mm;
  background: #ffffff;
  font-family: 'Amiri', 'Noto Sans Arabic', sans-serif;
  direction: rtl;
  color: ${theme.textPrimary};
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .receipt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 3px solid ${theme.primary};
  }

  .receipt-firm {
    flex: 1;
    text-align: center;
  }

  .receipt-firm-name {
    font-size: 28px;
    font-weight: 700;
    color: ${theme.primary};
    margin-bottom: 5px;
    letter-spacing: 1px;
  }

  .receipt-title {
    font-size: 20px;
    font-weight: 600;
    color: ${theme.textPrimary};
    text-transform: uppercase;
  }

  .receipt-info {
    margin-bottom: 20px;
    padding: 15px;
    background: ${theme.background};
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .receipt-info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .receipt-info-label {
    font-weight: 600;
    color: ${theme.textSecondary};
  }

  .receipt-info-value {
    color: ${theme.textPrimary};
  }

  .receipt-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    border: 1px solid #d1d5db;
    background: #ffffff;
  }

  .receipt-table th,
  .receipt-table td {
    border: 1px solid #d1d5db;
    padding: 12px 15px;
    text-align: right;
    font-size: 14px;
  }

  .receipt-table th {
    background: linear-gradient(to bottom, ${theme.primary}10, ${theme.primary}05);
    font-weight: 700;
    color: ${theme.textPrimary};
    text-transform: uppercase;
  }

  .receipt-table td {
    color: ${theme.textPrimary};
  }

  .receipt-table tr:nth-child(even) {
    background: rgba(0, 0, 0, 0.02);
  }

  .receipt-footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 2px solid ${theme.primary};
    text-align: center;
    font-size: 12px;
    color: ${theme.textSecondary};
    font-style: italic;
  }

  .receipt-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 48px;
    color: rgba(0, 0, 0, 0.1);
    font-weight: 700;
    opacity: 0.2;
    pointer-events: none;
  }
`;

const ConfirmationModal = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const ConfirmationTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.textPrimary};
  margin-bottom: 1rem;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: ${theme.error};
  color: white;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: ${theme.secondary};
  color: white;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
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
        className="w-full py-3 px-4 pl-12 pr-12 bg-white rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-secondary text-right dir-rtl shadow-sm"
        dir="rtl"
        aria-label="بحث الدفعات"
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

const ConfirmationToast = ({ message, onConfirm, onCancel }) => (
  <ConfirmationModal>
    <ConfirmationTitle>{message}</ConfirmationTitle>
    <ConfirmationButtons>
      <ConfirmButton onClick={onConfirm}>تأكيد</ConfirmButton>
      <CancelButton onClick={onCancel}>إلغاء</CancelButton>
    </ConfirmationButtons>
  </ConfirmationModal>
);

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/paiements';
const CLIENTS_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/clients';
const AFFAIRES_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires';
const CONSULTATIONS_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/consultations';

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const selectStyles = {
  control: (provided) => ({
    ...provided,
    padding: '0.25rem',
    borderRadius: '0.5rem',
    borderColor: '#d1d5db',
    fontSize: '0.9rem',
    color: theme.textPrimary,
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.primary,
    },
    '&:focus': {
      borderColor: theme.primary,
      boxShadow: `0 0 0 3px ${theme.primary}20`,
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    zIndex: 1000,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? theme.primary : state.isFocused ? `${theme.primary}10` : 'white',
    color: state.isSelected ? 'white' : theme.textPrimary,
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? theme.primary : `${theme.primary}10`,
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme.textPrimary,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: theme.textSecondary,
  }),
  input: (provided) => ({
    ...provided,
    color: theme.textPrimary,
    textAlign: 'right',
  }),
};

function PaymentManagement({ setToken }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    client: '',
    date: '',
    mode_paiement: '',
  });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    client_id: '',
    affaire_id: '',
    paid_amount: '',
    mode_paiement: 'espece',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [filteredModalCases, setFilteredModalCases] = useState([]);
  const [filteredModalClients, setFilteredModalClients] = useState([]);
  const paymentsPerPage = 5;
  const receiptRef = useRef();

const toastOptions = {
    position: 'top',
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

      const decodedToken = decodeToken(token);
      const lawyerId = decodedToken?.id;

      if (!lawyerId) {
        toast.error('فشل تحديد هوية المحامي.', toastOptions);
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        const [paymentsRes, clientsRes, casesRes, sessionsRes] = await Promise.all([
          axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(CLIENTS_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(AFFAIRES_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(CONSULTATIONS_API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const validPayments = paymentsRes.data.filter(payment => {
          const isValid = payment.montant_total !== undefined && payment.paid_amount !== undefined;
          if (!isValid) {
            console.warn('Invalid payment entry:', payment);
          }
          return isValid;
        });
        setPayments(validPayments);
        setClients(clientsRes.data);
        setCases(casesRes.data);
        setSessions(sessionsRes.data);
        setFilteredModalClients(clientsRes.data.map(client => ({
          value: client._id,
          label: client.nom || 'غير محدد',
        })));
        setFilteredModalCases(casesRes.data.map(c => ({
          value: c._id,
          label: c.case_number || 'غير محدد',
          client_id: c.client_id?._id || c.client_id,
        })));
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          window.location.href = '/login';
          toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
        } else {
          toast.error('فشل جلب البيانات', toastOptions);
          console.error('Fetch error:', err.response?.data || err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setToken]);

  const generateReceiptPDF = async (payment) => {
    if (!payment) {
      toast.error('بيانات الدفعة غير متوفرة.', toastOptions);
      return;
    }

    const normalizedPayment = {
      _id: payment._id || 'غير متوفر',
      montant_total: payment.montant_total || 0,
      paid_amount: payment.paid_amount || 0,
      mode_paiement: payment.mode_paiement || 'غير متوفر',
      date_creation: payment.date_creation || new Date().toISOString(),
      client_nom: payment.client_id?.nom ||
                  clients.find(c => c._id === (payment.client_id?._id || payment.client_id))?.nom ||
                  'غير متوفر',
      affaire_titre: payment.affaire_id?.case_number ||
                     cases.find(c => c._id === (payment.affaire_id?._id || payment.affaire_id))?.case_number ||
                     'غير متوفر',
      consultation: payment.consultation_id || null,
    };

    setReceiptPayment(normalizedPayment);
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!receiptRef.current) {
      toast.error('فشل إنشاء إيصال الدفع: العنصر غير موجود', toastOptions);
      setReceiptPayment(null);
      return;
    }

    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const marginLeft = 15;
      const marginRight = 15;
      const imgWidth = pageWidth - marginLeft - marginRight;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', marginLeft, 10, imgWidth, imgHeight);
      pdf.save(`Payment_Receipt_${payment._id}.pdf`);
      toast.success('تم إنشاء إيصال الدفع بنجاح', toastOptions);
    } catch (err) {
      toast.error('فشل إنشاء إيصال الدفع', toastOptions);
      console.error('PDF generation error:', err);
    } finally {
      setReceiptPayment(null);
    }
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (filters.client) {
      filtered = filtered.filter(payment => payment.client_id?._id === filters.client);
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toISOString().split('T')[0];
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date_creation).toISOString().split('T')[0];
        return paymentDate === filterDate;
      });
    }

    if (filters.mode_paiement) {
      filtered = filtered.filter(payment => payment.mode_paiement === filters.mode_paiement);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        payment =>
          (payment.client_id?.nom && payment.client_id.nom.toLowerCase().includes(searchLower)) ||
          (payment.affaire_id?.case_number && payment.affaire_id.case_number.toLowerCase().includes(searchLower)) ||
          (payment.mode_paiement && payment.mode_paiement.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [payments, filters, searchTerm]);

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'client_id') {
      aValue = a.client_id?.nom || 'غير متوفر';
      bValue = b.client_id?.nom || 'غير متوفر';
    } else if (sortConfig.key === 'affaire_id') {
      const aCase = cases.find(c => c._id === (a.affaire_id?._id || a.affaire_id));
      const bCase = cases.find(c => c._id === (b.affaire_id?._id || b.affaire_id));
      aValue = aCase?.case_number || 'غير محدد';
      bValue = bCase?.case_number || 'غير محدد';
    } else if (sortConfig.key === 'mode_paiement') {
      aValue = a.mode_paiement || 'غير متوفر';
      bValue = b.mode_paiement || 'غير متوفر';
    }

    if (sortConfig.key === 'montant_total' || sortConfig.key === 'paid_amount') {
      return sortConfig.direction === 'asc' ? (aValue || 0) - (bValue || 0) : (bValue || 0) - (aValue || 0);
    } else if (sortConfig.key === 'date_creation') {
      return sortConfig.direction === 'asc'
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    } else {
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    }
  });

  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  const summary = {
    total: filteredPayments.length,
  };

  const headers = [
    { label: 'الموكل', key: 'client_id' },
    { label: 'رقم الملف', key: 'affaire_id' },
    { label: 'المدفوع (MAD)', key: 'paid_amount' },
    { label: 'طريقة الدفع', key: 'mode_paiement' },
    { label: 'تاريخ الإنشاء', key: 'date_creation' },
  ];

  const handleSort = (key) => {
    if (key) {
      setSortConfig({
        key,
        direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
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
  const data = filteredPayments.map(row => ({
    'الموكل': row.client_id?.nom || 'غير متوفر',
    'رقم الملف': cases.find(c => c._id === (row.affaire_id?._id || row.affaire_id))?.case_number || 'غير محدد',
    'المدفوع (MAD)': (row.paid_amount || 0).toFixed(2),
    'طريقة الدفع': row.mode_paiement || 'غير متوفر',
    'تاريخ الإنشاء': new Date(row.date_creation).toLocaleString('ar'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: headers.map(h => h.label), 
    skipHeader: false,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  saveAs(blob, `payments_${new Date().toISOString().split('T')[0]}.xlsx`);

  toast.success('تم تحميل البيانات بنجاح', toastOptions);
};

  const handleCheckboxChange = (id) => {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

const handleBulkDelete = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
    window.location.href = '/login';
    return;
  }

  confirmToast(`هل أنت متأكد من حذف ${selectedPayments.length} دفعة/دفعات؟`, async () => {
    try {
      await Promise.all(
        selectedPayments.map(id =>
          axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setPayments(prev => prev.filter(p => !selectedPayments.includes(p._id)));
      setSelectedPayments([]);
      console.log('تم حذف الدفعات المحددة بنجاح');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        console.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      } else {
        console.error('فشل حذف الدفعات:', err.response?.data || err.message);
      }
    }
  });
};
  const handleModalOpen = (payment = null) => {
    if (payment) {
      const clientId = payment.client_id?._id || (typeof payment.client_id === 'string' ? payment.client_id : '');
      setNewPayment({
        client_id: clientId,
        affaire_id: payment.affaire_id?._id || (typeof payment.affaire_id === 'string' ? payment.affaire_id : ''),
        paid_amount: payment.paid_amount || '',
        mode_paiement: payment.mode_paiement || 'espece',
      });
      setEditingId(payment._id);
      updateFilteredCases(clientId);
    } else {
      setNewPayment({
        client_id: '',
        affaire_id: '',
        paid_amount: '',
        mode_paiement: 'espece',
      });
      setEditingId(null);
      setFilteredModalCases(cases.map(c => ({
        value: c._id,
        label: c.case_number || 'غير محدد',
        client_id: c.client_id?._id || c.client_id,
      })));
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewPayment({
      client_id: '',
      affaire_id: '',
      paid_amount: '',
      mode_paiement: 'espece',
    });
    setEditingId(null);
    setError(null);
    setFilteredModalCases(cases.map(c => ({
      value: c._id,
      label: c.case_number || 'غير محدد',
      client_id: c.client_id?._id || c.client_id,
    })));
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    setNewPayment(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'client_id') {
      updateFilteredCases(value);
    }
  };

  const updateFilteredCases = (clientId) => {
    if (clientId) {
      const filtered = cases
        .filter(c => (c.client_id?._id || c.client_id) === clientId)
        .map(c => ({
          value: c._id,
          label: c.case_number || 'غير محدد',
          client_id: c.client_id?._id || c.client_id,
        }));
      setFilteredModalCases(filtered);
      setNewPayment(prev => ({
        ...prev,
        affaire_id: filtered.length === 1 ? filtered[0].value : '',
      }));
    } else {
      setFilteredModalCases(cases.map(c => ({
        value: c._id,
        label: c.case_number || 'غير محدد',
        client_id: c.client_id?._id || c.client_id,
      })));
      setNewPayment(prev => ({
        ...prev,
        affaire_id: '',
      }));
    }
  };

  const handleAddOrEditPayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.', toastOptions);
      window.location.href = '/login';
      return;
    }

    if (!newPayment.client_id) {
      toast.error('يرجى اختيار عميل', toastOptions);
      return;
    }
    if (!newPayment.paid_amount || parseFloat(newPayment.paid_amount) < 0) {
      toast.error('يرجى إدخال المبلغ المدفوع بشكل صحيح (0 أو أكثر)', toastOptions);
      return;
    }
    if (!newPayment.mode_paiement) {
      toast.error('يرجى اختيار طريقة الدفع', toastOptions);
      return;
    }

    try {
      const payload = {
        client_id: newPayment.client_id,
        affaire_id: newPayment.affaire_id || null,
        paid_amount: parseFloat(newPayment.paid_amount),
        mode_paiement: newPayment.mode_paiement,
        montant_total: parseFloat(newPayment.paid_amount),  
      };

      let response;
      if (editingId) {
        response = await axios.put(`${API_URL}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(prev =>
          prev.map(p => (p._id === editingId ? response.data : p))
        );
        toast.success('تم تعديل الدفعة بنجاح', toastOptions);
      } else {
        response = await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(prev => [...prev, response.data]);
        toast.success('تمت إضافة الدفعة بنجاح', toastOptions);
      }

      await generateReceiptPDF(response.data);
      handleModalClose();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        toast.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.', toastOptions);
      } else {
        toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ الدفعة', toastOptions);
        console.error('Submit error:', err.response?.data || err.message);
      }
    }
  };

const handleDelete = (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('لم يتم تسجيل الدخول. الرجاء تسجيل الدخول.');
    window.location.href = '/login';
    return;
  }

  confirmToast('هل أنت متأكد من حذف هذه الدفعة؟', async () => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(prev => prev.filter(p => p._id !== id));
      setSelectedPayments(prev => prev.filter(pid => pid !== id));
      console.log('تم حذف الدفعة بنجاح');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        window.location.href = '/login';
        console.error('انتهت جلسة تسجيل الدخول. الرجاء تسجيل الدخول مرة أخرى.');
      } else {
        console.error('فشل حذف الدفعة:', err.response?.data || err.message);
      }
    }
  });
};

  const handleShowDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
    setShowDetailsModal(false);
  };

  const formatSessionDisplay = (session) => {
    if (!session || (!session.date_debut && !session.heure_debut && !session._id)) {
      return 'غير متوفر';
    }
    if (!session.date_debut || !session.heure_debut) {
      return session._id || 'غير متوفر';
    }
    const date = new Date(session.date_debut).toLocaleDateString('ar');
    return `${date} ${session.heure_debut}`;
  };

  const clientOptions = filteredModalClients;
  const caseOptions = filteredModalCases;
  const modePaiementOptions = [
    { value: 'espece', label: 'نقدًا' },
    { value: 'cheque', label: 'شيك' },
  ];

  if (loading) {
    return (
      <PaymentContainer>
        <NavDash setToken={setToken} />
        <Sidebar setToken={setToken} />
        <MainContent>
          <PaymentsTable>
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
          </PaymentsTable>
        </MainContent>
      </PaymentContainer>
    );
  }

  return (
    <PaymentContainer>
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
          <Title>إدارة المدفوعات</Title>
          <ButtonGroup>
            {selectedPayments.length > 0 && (
              <DeleteButton onClick={handleBulkDelete}>
                <FaTrash /> حذف المحدد ({selectedPayments.length})
              </DeleteButton>
            )}
            <ActionButton onClick={handleExport}>
              <FaDownload /> تحميل
            </ActionButton>
            <ActionButton onClick={() => handleModalOpen()}>
              + دفعة جديدة
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <SummarySection>
          <SummaryCard whileHover={{ scale: 1.02 }}>
            <SummaryIconWrapper bgColor="#e6f3e9">
              <FileText className="h-6 w-6 text-green-600" />
            </SummaryIconWrapper>
            <SummaryText>
              <SummaryTitle>إجمالي الدفعات</SummaryTitle>
              <SummaryValue>{summary.total}</SummaryValue>
            </SummaryText>
          </SummaryCard>
        </SummarySection>
        <FiltersSection>
          <SearchBar
            onSearch={handleSearch}
            placeholder="ابحث بالموكل أو رقم الملف أو طريقة الدفع..."
            initialValue={searchTerm}
            className="flex-1 min-w-[220px]"
          />
          <FilterSelect name="client" value={filters.client} onChange={handleFilterChange}>
            <option value="">كل الموكلين</option>
            {clients.length > 0 ? (
              clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.nom}
                </option>
              ))
            ) : (
              <option value="">لا توجد عملاء متاحة</option>
            )}
          </FilterSelect>
          <FilterSelect name="mode_paiement" value={filters.mode_paiement} onChange={handleFilterChange}>
            <option value="">كل طرق الدفع</option>
            <option value="espece">نقدًا</option>
            <option value="cheque">شيك</option>
          </FilterSelect>
          <DatePicker
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </FiltersSection>
        <PaymentsTable>
          <TableWrapper>
            <thead>
              <tr>
                <TableHeader></TableHeader>
                {headers.map(header => (
                  <TableHeader
                    key={header.label}
                    onClick={() => handleSort(header.key)}
                  >
                    {header.label}
                  </TableHeader>
                ))}
                <TableHeader>الإجراءات</TableHeader>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map(row => {
                const caseMatch = cases.find(c => c._id === (row.affaire_id?._id || row.affaire_id));
                return (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>
                      <Checkbox
                        type="checkbox"
                        checked={selectedPayments.includes(row._id)}
                        onChange={() => handleCheckboxChange(row._id)}
                      />
                    </TableCell>
                    <TableCell>{row.client_id?.nom || 'غير متوفر'}</TableCell>
                    <TableCell>{caseMatch?.case_number || 'غير محدد'}</TableCell>
                    <TableCell>{(row.paid_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{row.mode_paiement === 'espece' ? 'نقدًا' : 'شيك'}</TableCell>
                    <TableCell>{new Date(row.date_creation).toLocaleString('ar')}</TableCell>
                    <TableCell>
                      <ActionIcons>
                        <ActionIcon
                          bgColor="#3b82f6"
                          hoverColor="#2563eb"
                          title="عرض التفاصيل"
                          onClick={() => handleShowDetails(row)}
                        >
                          <FaEye />
                        </ActionIcon>
                        <ActionIcon
                          bgColor="#10b981"
                          hoverColor="#059669"
                          title="تعديل"
                          onClick={() => handleModalOpen(row)}
                        >
                          <FaEdit />
                        </ActionIcon>
                        <ActionIcon
                          bgColor="#ef4444"
                          hoverColor="#dc2626"
                          title="حذف"
                          onClick={() => handleDelete(row._id)}
                        >
                          <FaTrash />
                        </ActionIcon>
                      </ActionIcons>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </tbody>
          </TableWrapper>
          {paginatedPayments.length === 0 && (
            <div className="text-center text-secondary p-6">
              {searchTerm
                ? `لا توجد نتائج مطابقة لـ "${searchTerm}"`
                : 'لا توجد بيانات'}
            </div>
          )}
        </PaymentsTable>
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
                  <ModalTitle>{editingId ? 'تعديل الدفعة' : 'إضافة دفعة جديدة'}</ModalTitle>
                  <CloseButton onClick={handleModalClose}>
                    <FaTimes className="h-6 w-6" />
                  </CloseButton>
                </ModalHeader>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg flex justify-between items-center border border-red-200"
                  >
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}
                <ModalForm onSubmit={handleAddOrEditPayment}>
                  <FormGrid>
                    <FormField>
                      <FormLabel>الموكل *</FormLabel>
                      <Select
                        options={clientOptions}
                        value={clientOptions.find(option => option.value === newPayment.client_id) || null}
                        onChange={(option) => handleSelectChange('client_id', option)}
                        placeholder="اختر الموكل..."
                        styles={selectStyles}
                        isSearchable
                        required
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>رقم الملف</FormLabel>
                      <Select
                        options={caseOptions}
                        value={caseOptions.find(option => option.value === newPayment.affaire_id) || null}
                        onChange={(option) => handleSelectChange('affaire_id', option)}
                        placeholder="اختر الملف..."
                        styles={selectStyles}
                        isSearchable
                        isDisabled={!newPayment.client_id}
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>المدفوع (MAD) *</FormLabel>
                      <FormInput
                        type="number"
                        name="paid_amount"
                        value={newPayment.paid_amount}
                        onChange={handleNewPaymentChange}
                        required
                        min="0"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>طريقة الدفع *</FormLabel>
                      <Select
                        options={modePaiementOptions}
                        value={modePaiementOptions.find(option => option.value === newPayment.mode_paiement) || null}
                        onChange={(option) => handleSelectChange('mode_paiement', option)}
                        placeholder="اختر طريقة الدفع..."
                        styles={selectStyles}
                        isSearchable
                        required
                      />
                    </FormField>
                  </FormGrid>
                  <SubmitButton type="submit">
                    {editingId ? 'حفظ التعديلات' : 'إضافة الدفعة'}
                  </SubmitButton>
                </ModalForm>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDetailsModal && selectedPayment && (
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
                  <ModalTitle>تفاصيل الدفعة</ModalTitle>
                  <CloseButton onClick={handleCloseDetails}>
                    <FaTimes className="h-6 w-6" />
                  </CloseButton>
                </ModalHeader>
                <ModalGrid>
                  <DetailItem>
                    <DetailLabel>الموكل</DetailLabel>
                    <DetailValue>{selectedPayment.client_id?.nom || 'غير متوفر'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>رقم الملف</DetailLabel>
                    <DetailValue>{cases.find(c => c._id === (selectedPayment.affaire_id?._id || selectedPayment.affaire_id))?.case_number || 'غير محدد'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>المدفوع</DetailLabel>
                    <DetailValue>{(selectedPayment.paid_amount || 0).toFixed(2)} MAD</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>طريقة الدفع</DetailLabel>
                    <DetailValue>{selectedPayment.mode_paiement === 'espece' ? 'نقدًا' : 'شيك'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>تاريخ الإنشاء</DetailLabel>
                    <DetailValue>{new Date(selectedPayment.date_creation).toLocaleString('ar')}</DetailValue>
                  </DetailItem>
                </ModalGrid>
                <SubmitButton type="button" onClick={handleCloseDetails}>
                  إغلاق
                </SubmitButton>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
        {receiptPayment && (
          <Receipt ref={receiptRef}>
            <div className="receipt-header">
              <div className="receipt-firm">
                <div className="receipt-firm-name">Qadiyatuk</div>
                <div className="receipt-title">إيصال دفع</div>
              </div>
            </div>
            <div className="receipt-info">
              <div className="receipt-info-item">
                <span className="receipt-info-label">رقم الإيصال</span>
                <span className="receipt-info-value">{receiptPayment._id}</span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-info-label">تاريخ الإصال</span>
                <span className="receipt-info-value">{new Date().toLocaleDateString('ar')}</span>
              </div>
            </div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>البند</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>الملف</td>
                  <td>{receiptPayment.affaire_titre}</td>
                </tr>
                <tr>
                  <td>الموكل</td>
                  <td>{receiptPayment.client_nom}</td>
                </tr>
                <tr>
                  <td>المدفوع</td>
                  <td>{(receiptPayment.paid_amount || 0).toFixed(2)} MAD</td>
                </tr>
                <tr>
                  <td>طريقة الدفع</td>
                  <td>{receiptPayment.mode_paiement === 'espece' ? 'نقدًا' : 'شيك'}</td>
                </tr>
                <tr>
                  <td>تاريخ الإنشاء</td>
                  <td>{new Date(receiptPayment.date_creation).toLocaleString('ar')}</td>
                </tr>
              </tbody>
            </table>
            <div className="receipt-footer">
              تم إنشاؤه بواسطة نظام إدارة المدفوعات - Qadiyatuk - {new Date().toLocaleDateString('ar')}
            </div>
            <div className="receipt-watermark">Qadiyatuk</div>
          </Receipt>
        )}
      </MainContent>
    </PaymentContainer>
  );
}

export default PaymentManagement;