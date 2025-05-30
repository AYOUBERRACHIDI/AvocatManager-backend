import React, { useState, useEffect, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaEye, FaTrash, FaUndo, FaTimes } from 'react-icons/fa';
import { Search, X, Download, FileText, Paperclip, Download as DownloadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
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
  success: '#d1fae5',
  warning: '#fefcbf',
  danger: '#fee2e2',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
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
    padding: 1rem;
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
  font-size: 1.75rem;
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

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.primary};
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
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

const SummarySection = styled.div`
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled(motion.div)`
  background: ${theme.cardBackground};
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SummaryIconWrapper = styled.div`
  padding: 0.5rem;
  background: ${props => props.bgColor};
  border-radius: 9999px;
`;

const SummaryText = styled.div`
  flex: 1;
`;

const SummaryTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${theme.textSecondary};
`;

const SummaryValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.textPrimary};
`;

const FiltersSection = styled.div`
  margin-bottom: 1.5rem;
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  border: 1px solid #e5e7eb;
`;

const DatePicker = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  width: 160px;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const CasesTable = styled.div`
  background: ${theme.cardBackground};
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: ${css`${fadeIn} 0.5s ease-out`};
  overflow-x: auto;
  border: 1px solid #e5e7eb;
`;

const TableWrapper = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  background: ${theme.primary}05;
  color: ${theme.textPrimary};
  font-weight: 600;
  text-align: right;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${theme.primary}10;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
`;

const SortArrow = styled.span`
  margin-left: 0.5rem;
  font-size: 0.7rem;
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
  padding: 0.75rem 1rem;
  color: ${theme.textPrimary};
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.8rem;
    max-width: 100px;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover:after {
    content: attr(data-tooltip);
    position: absolute;
    top: -2rem;
    right: 0;
    background: ${theme.textPrimary};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    z-index: 20;
    white-space: normal;
    max-width: 300px;
  }
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionIcon = styled.button`
  padding: 0.4rem;
  background: ${props => props.bgColor};
  color: white;
  border-radius: 0.375rem;
  font-size: 0.8rem;
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
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.textPrimary};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
    white-space: nowrap;
    z-index: 20;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Checkbox = styled.input`
  accent-color: ${theme.primary};
  width: 1rem;
  height: 1rem;
  cursor: pointer;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => (props.active ? theme.primary : 'white')};
  color: ${props => (props.active ? 'white' : theme.textPrimary)};
  border: 1px solid ${props => (props.active ? theme.primary : '#d1d5db')};
  border-radius: 0.375rem;
  font-size: 0.85rem;
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
  overflow-y: auto;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  position: relative;

  @media (max-width: 640px) {
    padding: 1rem;
    max-width: 95%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  color: ${theme.textSecondary};
  font-size: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    color: ${theme.textPrimary};
    transform: scale(1.1);
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.textSecondary};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  word-break: break-word;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: ${theme.background};
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  width: 200px;
  padding-right: 2rem;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 200px;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.textSecondary};
  width: 1rem;
  height: 1rem;
`;

const ErrorMessage = styled(motion.div)`
  padding: 0.75rem;
  background: ${theme.danger};
  color: ${theme.textPrimary};
  border-radius: 0.375rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalToastWrapper = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalToastButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin: 0.5rem;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ConfirmButton = styled(ModalToastButton)`
  background: ${theme.primary};
  color: white;

  &:hover {
    background: ${theme.primaryDark};
  }
`;

const CancelButton = styled(ModalToastButton)`
  background: ${theme.secondary};
  color: white;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.primary};
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomButton = styled.button`
  padding: 0.5rem;
  background: ${theme.cardBackground};
  color: ${theme.textPrimary};
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.primary};
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires';

const CaseArchives = ({ setToken }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [archivedCases, setArchivedCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCases, setSelectedCases] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avocatId, setAvocatId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const casesPerPage = 4;
  const navigate = useNavigate();

  const roleDisplay = {
    plaignant: 'مدعي',
    défendeur: 'مدعى عليه',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAvocatId(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('فشل التحقق من المصادقة');
        toast.error('فشل التحقق من المصادقة');
        navigate('/login');
      }
    } else {
      setError('لم يتم العثور على رمز المصادقة');
      toast.error('لم يتم العثور على رمز المصادقة');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (avocatId) {
      fetchArchivedCases();
    }
  }, [avocatId]);

  const fetchArchivedCases = async () => {
    if (!avocatId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/archives/avocat/${avocatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setArchivedCases(response.data);
      setFilteredCases(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setArchivedCases([]);
        setFilteredCases([]);
      } else {
        setError('فشل جلب الملفات المؤرشفة');
        console.error('Fetch archived cases error:', error.response?.data);
        toast.error('فشل جلب الملفات المؤرشفة');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = useCallback(() => {
    let filtered = archivedCases;
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.client_id?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.adversaire?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((c) => {
        const creationDate = new Date(c.date_creation);
        creationDate.setHours(0, 0, 0, 0);
        return (
          creationDate.getFullYear() === selectedDate.getFullYear() &&
          creationDate.getMonth() === selectedDate.getMonth() &&
          creationDate.getDate() === selectedDate.getDate()
        );
      });
    }
    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [archivedCases, searchQuery, filterDate]);

  const handleRestore = (id) => {
    if (isActionLoading) return;
    toast(
      (t) => (
        <ModalToastWrapper>
          <span className="text-lg font-semibold mb-2 block">تأكيد الاستعادة</span>
          <span>هل أنت متأكد من استعادة هذا الملف؟</span>
          <div className="flex justify-center gap-2 mt-4">
            <ConfirmButton
              onClick={async () => {
                setIsActionLoading(true);
                try {
                  await axios.put(
                    `${API_URL}/restore/${id}`,
                    {},
                    {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                  );
                  setArchivedCases(archivedCases.filter((c) => c._id !== id));
                  setFilteredCases(filteredCases.filter((c) => c._id !== id));
                  setSelectedCases(selectedCases.filter((c) => c !== id));
                  setError(null);
                  toast.success('تم استعادة الملف بنجاح');
                } catch (error) {
                  setError('فشل استعادة الملف');
                  toast.error('فشل استعادة الملف');
                } finally {
                  setIsActionLoading(false);
                  toast.dismiss(t.id);
                }
              }}
            >
              تأكيد
            </ConfirmButton>
            <CancelButton onClick={() => toast.dismiss(t.id)}>إلغاء</CancelButton>
          </div>
        </ModalToastWrapper>
      ),
      { duration: Infinity, style: { background: 'transparent', boxShadow: 'none' } }
    );
  };

  const handlePermanentDelete = (id) => {
    if (isActionLoading) return;
    toast(
      (t) => (
        <ModalToastWrapper>
          <span className="text-lg font-semibold mb-2 block">تأكيد الحذف النهائي</span>
          <span>هل أنت متأكد من الحذف النهائي لهذا الملف؟ هذا الإجراء لا يمكن التراجع عنه.</span>
          <div className="flex justify-center gap-2 mt-4">
            <ConfirmButton
              onClick={async () => {
                setIsActionLoading(true);
                try {
                  await axios.delete(`${API_URL}/permanent/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                  });
                  setArchivedCases(archivedCases.filter((c) => c._id !== id));
                  setFilteredCases(filteredCases.filter((c) => c._id !== id));
                  setSelectedCases(selectedCases.filter((c) => c !== id));
                  setError(null);
                  toast.success('تم الحذف النهائي للملف بنجاح');
                } catch (error) {
                  setError('فشل الحذف النهائي للملف');
                  toast.error('فشل الحذف النهائي للملف');
                } finally {
                  setIsActionLoading(false);
                  toast.dismiss(t.id);
                }
              }}
            >
              تأكيد
            </ConfirmButton>
            <CancelButton onClick={() => toast.dismiss(t.id)}>إلغاء</CancelButton>
          </div>
        </ModalToastWrapper>
      ),
      { duration: Infinity, style: { background: 'transparent', boxShadow: 'none' } }
    );
  };

  const handleBulkPermanentDelete = () => {
    if (isActionLoading || selectedCases.length === 0) return;
    toast(
      (t) => (
        <ModalToastWrapper>
          <span className="text-lg font-semibold mb-2 block">تأكيد الحذف النهائي</span>
          <span>هل أنت متأكد من الحذف النهائي لـ {selectedCases.length} ملفات؟</span>
          <div className="flex justify-center gap-2 mt-4">
            <ConfirmButton
              onClick={async () => {
                setIsActionLoading(true);
                const selectedCasesToDelete = selectedCases;
                setSelectedCases([]);
                try {
                  await Promise.all(
                    selectedCasesToDelete.map((id) =>
                      axios.delete(`${API_URL}/permanent/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                      })
                    )
                  );
                  setArchivedCases(archivedCases.filter((c) => !selectedCasesToDelete.includes(c._id)));
                  setFilteredCases(filteredCases.filter((c) => !selectedCasesToDelete.includes(c._id)));
                  setError(null);
                  toast.success('تم الحذف النهائي للملفات المحددة بنجاح');
                } catch (error) {
                  setError('فشل الحذف النهائي للملفات');
                  toast.error('فشل الحذف النهائي للملفات');
                } finally {
                  setIsActionLoading(false);
                  toast.dismiss(t.id);
                }
              }}
            >
              تأكيد
            </ConfirmButton>
            <CancelButton onClick={() => toast.dismiss(t.id)}>إلغاء</CancelButton>
          </div>
        </ModalToastWrapper>
      ),
      { duration: Infinity, style: { background: 'transparent', boxShadow: 'none' } }
    );
  };

  const handleExport = () => {
    const headers = [
      'رقم الملف',
      'النوع الرئيسي',
      'النوع الفرعي',
      'الدور',
      'المحامي',
      'الموكل',
      'الخصم',
      'تاريخ الإنشاء',
      'تاريخ الأرشفة',
      'ملاحظات الأرشفة',
      'عدد المرفقات',
      'المرفقات',
    ];

    const data = archivedCases.map((row) => {
      return {
        'رقم الملف': row.case_number || 'غير محدد',
        'النوع الرئيسي': row.category || 'غير محدد',
        'النوع الفرعي': row.type || 'غير محدد',
        'الدور': roleDisplay[row.client_role] || row.client_role || 'غير محدد',
        'المحامي': `${row.avocat_id?.nom || ''} ${row.avocat_id?.prenom || ''}`.trim(),
        'الموكل': row.client_id?.nom || 'غير محدد',
        'الخصم': row.adversaire || 'غير محدد',
        'تاريخ الإنشاء': new Date(row.date_creation).toLocaleDateString('fr-FR'),
        'تاريخ الأرشفة': new Date(row.archivedAt).toLocaleDateString('fr-FR'),
        'ملاحظات الأرشفة': row.archiveRemarks || '',
        'عدد المرفقات': row.attachments?.length || 0,
        'المرفقات': (row.attachments || []).map((file) => getFileName(file)).join('; ')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الملفات المؤرشفة');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob, `archived_cases_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sorted = [...filteredCases].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      if (key === 'avocat_id') {
        aValue = `${a.avocat_id?.nom || ''} ${a.avocat_id?.prenom || ''}`;
        bValue = `${b.avocat_id?.nom || ''} ${b.avocat_id?.prenom || ''}`;
      } else if (key === 'type') {
        aValue = a.type || '';
        bValue = b.type || '';
      } else if (key === 'client_id') {
        aValue = a.client_id?.nom || '';
        bValue = b.client_id?.nom || '';
      } else if (key === 'adversaire' || key === 'archiveRemarks') {
        aValue = aValue || '';
        bValue = bValue || '';
      } else if (key === 'date_creation' || key === 'archivedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (key === 'case_number' || key === 'client_role') {
        aValue = aValue || '';
        bValue = bValue || '';
      }
      if (typeof aValue === 'string' && key !== 'date_creation' && key !== 'archivedAt') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return direction === 'asc' ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
    });
    setFilteredCases(sorted);
  };

  const getFileUrl = (file) => {
    if (typeof file === 'string') {
      return file;
    }
    if (file && typeof file === 'object' && file.url) {
      return file.url;
    }
    return null;
  };

  const getFileName = (file) => {
    if (typeof file === 'string') {
      return file.split('/').pop() || 'ملف غير صالح';
    }
    if (file && typeof file === 'object' && file.name) {
      return file.name;
    }
    if (file && typeof file === 'object' && file.url) {
      return file.url.split('/').pop() || 'ملف غير صالح';
    }
    return 'ملف غير صالح';
  };

  const handleDownloadAttachment = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token d'authentification manquant");

      const fileUrl = getFileUrl(file);
      if (!fileUrl) {
        throw new Error('Invalid file URL');
      }

      let url;
      try {
        url = new URL(fileUrl);
      } catch (e) {
        throw new Error('Invalid URL format');
      }

      const segments = url.pathname.split('/');
      const uploadIndex = segments.findIndex(s => s === 'upload');
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL: missing upload segment');
      }

      const versionIndex = uploadIndex + 1;
      const publicId = segments
        .slice(versionIndex + (segments[versionIndex].startsWith('v') ? 1 : 0))
        .join('/')
        .split('.')[0];

      console.log('📂 File URL:', fileUrl);
      console.log('📄 Extracted publicId:', publicId);

      const response = await axios.get(
        `${API_URL}/download/${encodeURIComponent(publicId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { signedUrl, fileName } = response.data;

      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName || getFileName(file);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('✅ تم تحميل الملف بنجاح');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement :', error);
      let errorMessage = 'فشل تحميل الملف. تحقق من الاتصال أو الرابط.';
      if (error.message.includes('Invalid file URL')) {
        errorMessage = 'رابط الملف غير صالح';
      } else if (error.message.includes('Invalid URL format')) {
        errorMessage = 'تنسيق رابط الملف غير صالح';
      } else if (error.response?.status === 404) {
        errorMessage = 'الملف غير موجود';
      } else if (error.response?.status === 401) {
        errorMessage = 'غير مصرح لتحميل الملف';
      }
      toast.error(errorMessage);
    }
  };

  const handlePreviewAttachment = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token d'authentification manquant");

      const fileUrl = getFileUrl(file);
      if (!fileUrl) {
        throw new Error('Invalid file URL');
      }

      let url;
      try {
        url = new URL(fileUrl);
      } catch (e) {
        throw new Error('Invalid URL format');
      }

      const segments = url.pathname.split('/');
      const uploadIndex = segments.findIndex(s => s === 'upload');
      if (uploadIndex === -1 || !segments.includes('affaires')) {
        throw new Error('Invalid Cloudinary URL');
      }

      const versionIndex = uploadIndex + 1;
      const publicId = segments
        .slice(versionIndex + (segments[versionIndex].startsWith('v') ? 1 : 0))
        .join('/')
        .split('.')[0];

      console.log('📂 File URL:', fileUrl);
      console.log('📄 Extracted publicId:', publicId);

      const response = await axios.get(
        `${API_URL}/preview/${encodeURIComponent(publicId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { signedUrl, fileType } = response.data;

      const supportedPreviewTypes = ['pdf', 'jpg', 'jpeg', 'png'];
      const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

      if (supportedPreviewTypes.includes(fileType)) {
        setPreviewFile({ url: signedUrl, type: fileType });
        setShowPreviewModal(true);
      } else if (officeTypes.includes(fileType)) {
        window.open(
          `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`,
          '_blank'
        );
      } else {
        toast.error('لا يمكن معاينة هذا النوع من الملفات، يرجى تحميله');
        await handleDownloadAttachment(file);
      }
    } catch (error) {
      console.error('❌ Error previewing file:', error);
      let errorMessage = 'فشل معاينة الملف';
      if (error.message.includes('Invalid file URL')) {
        errorMessage = 'رابط الملف غير صالح';
      } else if (error.message.includes('Invalid URL format')) {
        errorMessage = 'تنسيق رابط الملف غير صالح';
      } else if (error.response?.status === 404) {
        errorMessage = 'الملف غير موجود';
      } else if (error.response?.status === 401) {
        errorMessage = 'غير مصرح لمعاينة الملف';
      }
      toast.error(errorMessage);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const getTypeDisplay = (caseItem) => {
    return caseItem.type || 'غير محدد';
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCase(null);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setZoomLevel(1);
    if (previewFile?.url) {
      window.URL.revokeObjectURL(previewFile.url);
    }
  };

  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * casesPerPage,
    currentPage * casesPerPage
  );

  const summary = {
    total: archivedCases.length,
  };

  if (loading) {
    return (
      <Container>
        <NavDash setToken={setToken} />
        <Sidebar setToken={setToken} />
        <MainContent>
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <NavDash setToken={setToken} />
      <Sidebar setToken={setToken} />
      <MainContent>
        <Toaster position="top-center" reverseOrder={false} />
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
        <HeaderSection>
          <Title>أرشيف الملفات القانونية</Title>
          <ButtonGroup>
            {selectedCases.length > 0 && (
              <DeleteButton onClick={handleBulkPermanentDelete} disabled={isActionLoading}>
                <FaTrash /> حذف نهائي للمحدد ({selectedCases.length})
              </DeleteButton>
            )}
            <ActionButton onClick={handleExport} disabled={isActionLoading}>
              <Download /> تحميل
            </ActionButton>
            <ActionButton
              onClick={() => navigate('/legal-case-management')}
              disabled={isActionLoading}
            >
              العودة إلى الملفات النشطة
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <SummarySection>
          <SummaryCard whileHover={{ scale: 1.02 }}>
            <SummaryIconWrapper bgColor="#e6f3e9">
              <FileText className="h-5 w-5 text-green-600" />
            </SummaryIconWrapper>
            <SummaryText>
              <SummaryTitle>إجمالي الملفات المؤرشفة</SummaryTitle>
              <SummaryValue>{summary.total}</SummaryValue>
            </SummaryText>
          </SummaryCard>
        </SummarySection>
        <FiltersSection>
          <SearchWrapper>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilter();
              }}
              placeholder="البحث حسب الموكل أو الخصم أو رقم الملف..."
              aria-label="البحث في الملفات المؤرشفة"
            />
            <SearchIcon />
          </SearchWrapper>
          <DatePicker
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            onBlur={handleFilter}
            aria-label="تصفية حسب تاريخ الإنشاء"
          />
        </FiltersSection>
        <CasesTable>
          <TableWrapper>
            <thead>
              <tr>
                <TableHeader>
                  <Checkbox
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedCases(
                        e.target.checked ? archivedCases.map((c) => c._id) : []
                      )
                    }
                    checked={
                      selectedCases.length === archivedCases.length && archivedCases.length > 0
                    }
                    aria-label="تحديد كل الملفات"
                  />
                </TableHeader>
                <TableHeader onClick={() => handleSort('case_number')}>
                  رقم الملف
                  {sortConfig.key === 'case_number' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('type')}>
                  النوع
                  {sortConfig.key === 'type' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('client_id')}>
                  الموكل
                  {sortConfig.key === 'client_id' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('adversaire')}>
                  الخصم
                  {sortConfig.key === 'adversaire' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('client_role')}>
                  الدور
                  {sortConfig.key === 'client_role' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('date_creation')}>
                  تاريخ الإنشاء
                  {sortConfig.key === 'date_creation' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('archivedAt')}>
                  تاريخ الأرشفة
                  {sortConfig.key === 'archivedAt' && (
                    <SortArrow>{sortConfig.direction === 'asc' ? '↑' : '↓'}</SortArrow>
                  )}
                </TableHeader>
                <TableHeader>المرفقات</TableHeader>
                <TableHeader>الإجراءات</TableHeader>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedCases.map((caseItem) => (
                  <TableRow
                    key={caseItem._id}
                    as={motion.tr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>
                      <Checkbox
                        type="checkbox"
                        checked={selectedCases.includes(caseItem._id)}
                        onChange={() =>
                          setSelectedCases(
                            selectedCases.includes(caseItem._id)
                              ? selectedCases.filter((id) => id !== caseItem._id)
                              : [...selectedCases, caseItem._id]
                          )
                        }
                        aria-label={`تحديد ملف ${caseItem.case_number || 'غير محدد'}`}
                      />
                    </TableCell>
                    <TableCell>
                      <TooltipWrapper data-tooltip={caseItem.case_number || 'غير محدد'}>
                        {caseItem.case_number || 'غير محدد'}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell>
                      <TooltipWrapper data-tooltip={getTypeDisplay(caseItem)}>
                        {getTypeDisplay(caseItem)}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell>
                      <TooltipWrapper data-tooltip={caseItem.client_id?.nom || 'غير محدد'}>
                        {caseItem.client_id?.nom || 'غير محدد'}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell>
                      <TooltipWrapper data-tooltip={caseItem.adversaire || 'غير محدد'}>
                        {caseItem.adversaire || 'غير محدد'}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell>
                      <TooltipWrapper
                        data-tooltip={
                          roleDisplay[caseItem.client_role] || caseItem.client_role
                        }
                      >
                        {roleDisplay[caseItem.client_role] || caseItem.client_role}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell>
                      {new Date(caseItem.date_creation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Date(caseItem.archivedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        aria-label={`عرض مرفقات ملف ${caseItem.case_number || 'غير محدد'}`}
                        disabled={isActionLoading}
                      >
                        <Paperclip className="h-4 w-4" />
                        ({caseItem.attachments ? caseItem.attachments.length : 0})
                      </button>
                    </TableCell>
                    <TableCell>
                      <ActionIcons>
                        <ActionIcon
                          bgColor="#3b82f6"
                          hoverColor="#2563eb"
                          title="عرض"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDetailsModal(true);
                          }}
                          aria-label={`عرض تفاصيل ملف ${caseItem.case_number || 'غير محدد'}`}
                          disabled={isActionLoading}
                        >
                          <FaEye className="h-3 w-3" />
                        </ActionIcon>
                        <ActionIcon
                          bgColor={theme.primary}
                          hoverColor={theme.primaryDark}
                          title="استعادة"
                          onClick={() => handleRestore(caseItem._id)}
                          aria-label={`استعادة ملف ${caseItem.case_number || 'غير محدد'}`}
                          disabled={isActionLoading}
                        >
                          <FaUndo className="h-3 w-3" />
                        </ActionIcon>
                        <ActionIcon
                          bgColor={theme.error}
                          hoverColor="#dc2626"
                          title="حذف نهائي"
                          onClick={() => handlePermanentDelete(caseItem._id)}
                          aria-label={`حذف نهائي لملف ${caseItem.case_number || 'غير محدد'}`}
                          disabled={isActionLoading}
                        >
                          <FaTrash className="h-3 w-3" />
                        </ActionIcon>
                      </ActionIcons>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </tbody>
          </TableWrapper>
          {paginatedCases.length === 0 && (
            <div className="text-center text-secondary p-4">
              {searchQuery
                ? `لا توجد نتائج مطابقة لـ "${searchQuery}"`
                : 'لا توجد ملفات مؤرشفة متاحة'}
            </div>
          )}
        </CasesTable>
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isActionLoading}
            aria-label="الصفحة السابقة"
          >
            السابق
          </PageButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PageButton
              key={page}
              active={currentPage === page}
              onClick={() => setCurrentPage(page)}
              disabled={isActionLoading}
              aria-label={`الصفحة ${page}`}
            >
              {page}
            </PageButton>
          ))}
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isActionLoading}
            aria-label="الصفحة التالية"
          >
            التالي
          </PageButton>
        </Pagination>
        <AnimatePresence>
          {showDetailsModal && selectedCase && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseDetailsModal}
            >
              <ModalContent
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>تفاصيل الملف المؤرشف</ModalTitle>
                  <CloseButton
                    onClick={handleCloseDetailsModal}
                    aria-label="إغلاق نافذة التفاصيل"
                  >
                    <X className="h-5 w-5" />
                  </CloseButton>
                </ModalHeader>
                <ModalGrid>
                  <DetailItem>
                    <DetailLabel>رقم القضية</DetailLabel>
                    <DetailValue>{selectedCase.case_number || 'غير محدد'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>النوع</DetailLabel>
                    <DetailValue>{getTypeDisplay(selectedCase)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>دور الموكل</DetailLabel>
                    <DetailValue>
                      {roleDisplay[selectedCase.client_role] || selectedCase.client_role}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>المحامي</DetailLabel>
                    <DetailValue>{`${selectedCase.avocat_id?.nom || ''} ${
                      selectedCase.avocat_id?.prenom || ''
                    }`}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>الموكل</DetailLabel>
                    <DetailValue>{selectedCase.client_id?.nom || 'غير محدد'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>الخصم</DetailLabel>
                    <DetailValue>{selectedCase.adversaire || 'غير محدد'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>تاريخ الإنشاء</DetailLabel>
                    <DetailValue>
                      {new Date(selectedCase.date_creation).toLocaleDateString('fr-FR')}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>تاريخ الأرشفة</DetailLabel>
                    <DetailValue>
                      {new Date(selectedCase.archivedAt).toLocaleDateString('fr-FR')}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>ملاحظات الأرشفة</DetailLabel>
                    <DetailValue>
                      {selectedCase.archiveRemarks || 'لا توجد ملاحظات'}
                    </DetailValue>
                  </DetailItem>
                </ModalGrid>
                {selectedCase.attachments && selectedCase.attachments.length > 0 ? (
                  <AttachmentList className="space-y-2">
                    <DetailLabel className="mb-1">المرفقات</DetailLabel>
                    {selectedCase.attachments.map((file, index) => (
                      <AttachmentItem
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md shadow-sm"
                      >
                        <TooltipWrapper data-tooltip={getFileName(file)}>
                          <span className="text-sm truncate max-w-xs text-right">
                            {getFileName(file)}
                          </span>
                        </TooltipWrapper>
                        <div className="flex gap-2">
                          <ActionIcon
                            bgColor={theme.primary}
                            hoverColor={theme.primaryDark}
                            title="معاينة"
                            onClick={() => handlePreviewAttachment(file)}
                            aria-label={`معاينة ${getFileName(file)}`}
                            disabled={isActionLoading}
                          >
                            <FaEye className="h-4 w-4" />
                          </ActionIcon>
                          <ActionIcon
                            bgColor="#6b7280"
                            hoverColor="#4b5563"
                            title="تحميل"
                            onClick={() => handleDownloadAttachment(file)}
                            aria-label={`تحميل ${getFileName(file)}`}
                            disabled={isActionLoading}
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </ActionIcon>
                        </div>
                      </AttachmentItem>
                    ))}
                  </AttachmentList>
                ) : (
                  <DetailItem>
                    <DetailLabel>المرفقات</DetailLabel>
                    <DetailValue>لا توجد مرفقات</DetailValue>
                  </DetailItem>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
          {showPreviewModal && previewFile && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ModalContent
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ModalHeader>
                  <ModalTitle>معاينة الملف</ModalTitle>
                  {['jpg', 'jpeg', 'png'].includes(previewFile.type) && (
                    <div className="flex gap-2">
                      <ZoomButton
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        aria-label="تصغير الصورة"
                      >
                        ➖
                      </ZoomButton>
                      <ZoomButton
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        aria-label="تكبير الصورة"
                      >
                        ➕
                      </ZoomButton>
                    </div>
                  )}
                  <CloseButton
                    onClick={handleClosePreviewModal}
                    aria-label="إغلاق نافذة المعاينة"
                  >
                    <FaTimes className="h-5 w-5" />
                  </CloseButton>
                </ModalHeader>
                {(() => {
                  const fileType = previewFile.type?.toLowerCase();
                  const browserViewable = ['pdf', 'jpg', 'jpeg', 'png'];
                  const officeViewable = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

                  if (browserViewable.includes(fileType)) {
                    if (['jpg', 'jpeg', 'png'].includes(fileType)) {
                      return (
                        <div className="overflow-auto max-h-[80vh] max-w-full text-center">
                          <div
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: 'center',
                              display: 'inline-block',
                            }}
                          >
                            <img
                              src={previewFile.url}
                              alt="Image Preview"
                              className="rounded-md max-h-[70vh]"
                            />
                          </div>
                        </div>
                      );
                    } else if (fileType === 'pdf') {
                      return (
                        <iframe
                          src={previewFile.url}
                          title="PDF Preview"
                          className="w-full h-[80vh] rounded-md"
                          frameBorder="0"
                        />
                      );
                    }
                  } else if (officeViewable.includes(fileType)) {
                    return (
                      <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                          previewFile.url
                        )}`}
                        title="Office File Preview"
                        className="w-full h-[80vh] rounded-md"
                        frameBorder="0"
                      />
                    );
                  } else {
                    return (
                      <div className="text-center text-red-600 font-semibold">
                        ⚠️ لا يمكن معاينة هذا النوع من الملفات. <br />
                        يرجى تحميله مباشرة.
                        <div className="mt-4">
                          <SubmitButton
                            type="button"
                            onClick={() => handleDownloadAttachment(previewFile.url)}
                          >
                            تحميل
                          </SubmitButton>
                        </div>
                      </div>
                    );
                  }
                })()}
                <div className="flex justify-between mt-4">
                  <SubmitButton type="button" onClick={handleClosePreviewModal}>
                    إغلاق
                  </SubmitButton>
                  <SubmitButton
                    type="button"
                    onClick={() => handleDownloadAttachment(previewFile.url)}
                  >
                    تحميل
                  </SubmitButton>
                </div>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </MainContent>
    </Container>
  );
};

export default CaseArchives;