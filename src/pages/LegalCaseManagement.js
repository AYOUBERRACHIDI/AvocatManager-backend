import React, { useState, useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaEye, FaEdit, FaTrash, FaTimes, FaArchive, FaPlus, FaMinus } from 'react-icons/fa';
import { Search, Plus, Download, Calendar, User, FileText, Paperclip, Download as DownloadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import NavDash from '../components/NavDash';
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
  // font-family: 'Amiri', 'Noto Sans Arabic', sans-serif;
  font-size: 1rem; /* Taille de police de base */
  line-height: 1.5; /* Espacement pour une meilleure lisibilité */
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
  display: grid;
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
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  border: 1px solid #e5e7eb;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  width: 180px;
  min-width: 260px;

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
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  width: 200px;
  min-width: 120px;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }
`;

const TabsWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => (props.active ? theme.primary : theme.textSecondary)};
  background: ${props => (props.active ? `${theme.primary}10` : 'transparent')};
  border-bottom: ${props => (props.active ? `2px solid ${theme.primary}` : 'none')};
  transition: all 0.3s ease;

  &:hover {
    color: ${theme.primary};
    background: ${theme.primary}05;
  }
`;

const CasesTable = styled.div`
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

const SortArrow = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
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

const StatusBadge = styled.span`
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  ${props => props.color};
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
  font-size: 1rem; /* Augmenté pour une meilleure visibilité */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  width: 2.5rem; /* Taille fixe pour uniformité */
  height: 2.5rem;

  & svg {
    width: 1.25rem; /* Taille des icônes */
    height: 1.25rem;
  }

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
    // font-family: 'Amiri', 'Noto Sans Arabic', sans-serif; /* Police cohérente */
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
  overflow-y: auto;
  padding: 1rem;
`;
const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  position: relative;
  // font-family: 'Amiri', 'Noto Sans Arabic', sans-serif; /* Ajouté */
  font-size: 0.9rem; /* Ajustement pour la lisibilité */
  line-height: 1.5;

  @media (max-width: 640px) {
    padding: 1rem;
    max-width: 90%;
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
  font-size: 1.5rem;
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

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  > * {
    min-width: 0;
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
const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FormLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.textPrimary};
`;

const FormInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
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

  &::placeholder {
    color: ${theme.textSecondary};
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }

  &::placeholder {
    color: ${theme.textSecondary};
  }
`;
const AttachmentNameInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  color: ${theme.textPrimary};
  background: white;
  transition: all 0.3s ease;
  margin-top: 0.25rem;

  &:hover {
    border-color: ${theme.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px ${theme.primary}20;
  }

  &::placeholder {
    color: ${theme.textSecondary};
  }
`;
const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FileInput = styled.input`
  display: none; /* Masquer l'input natif */
`;

const CustomFileButton = styled.button`
  padding: 0.4rem 0.75rem; /* Identique au ::file-selector-button */
  width: 258px;
  border: none;
  border-radius: 0.375rem;
  background: ${theme.primary};
  /* background #0000; */
  color: white;
  font-weight: 500;
  font-size: 0.8rem; /* Identique au ::file-selector-button */
  cursor: pointer;
  transition: background 0.3s ease; /* Identique au ::file-selector-button */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${theme.primaryDark}; /* Identique au ::file-selector-button:hover */
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileList = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: ${theme.background};
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
`;

const AttachmentTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: ${theme.success};
  color: ${theme.textPrimary};
  border-radius: 9999px;
  font-size: 0.75rem;
  margin: 0.2rem;
`;

const RemoveAttachmentButton = styled.button`
  margin-left: 0.5rem;
  color: ${theme.error};
  background: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #dc2626;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem;
  background: ${theme.primary};
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 160px;
  margin: 0.75rem auto 0;

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

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 0.375rem;
  background: white;
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
  min-width: 200px;
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
  min-width: 200px;
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
const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;
const ZoomButton = styled.button`
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #2e7d32;
  border: 1px solid #2e7d32;
  border-radius: 50%;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #2e7d32;
    color: #ffffff;
    box-shadow: 0 0 8px rgba(46, 125, 50, 0.5);
    transform: scale(1.1);
  }

  & > span {
    position: absolute;
    inset: 0;
    background: #facc15;
    opacity: 0;
    animation: ${ripple} 1s ease-in-out;
  }

  &:hover > span {
    opacity: 0.2;
  }

  @media (min-width: 768px) {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
`;

const ZoomButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    padding: '0.2rem',
    borderRadius: '0.375rem',
    borderColor: state.isFocused ? theme.primary : '#d1d5db',
    fontSize: '0.85rem',
    color: theme.textPrimary,
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    boxShadow: state.isFocused ? `0 0 0 3px ${theme.primary}20` : 'none',
    '&:hover': {
      borderColor: theme.primary,
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    zIndex: 1000,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? theme.primary : state.isFocused ? `${theme.primary}10` : 'white',
    color: state.isSelected ? 'white' : theme.textPrimary,
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
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
    fontSize: '0.85rem',
  }),
  input: (provided) => ({
    ...provided,
    color: theme.textPrimary,
    textAlign: 'right',
  }),
};

const API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/affaires';
const CLIENTS_API_URL = 'http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/clients';

const CASE_TYPES = {
  civil: [
    'نزاعات التعويض',
    'نزاعات العقود',
    'الاستحقاق وإلغاء الهبة',
    'المسؤولية المدنية',
    'تسجيل الممتلكات',
    'نزاعات ملكية الممتلكات',
    'تقسيم الممتلكات',
    'الاستملاك للمنفعة العامة',
  ],
  criminal: [
    'الاعتداءات الجنحية',
    'السرقة، الاحتيال، خيانة الأمانة',
    'المخالفات المرورية الخطيرة',
    'القتل العمد أو الإهمال',
    'الاغتصاب والاعتداء غير اللائق',
    'الاختلاس، الرشوة، سوء الاستخدام',
    'تشكيل عصابة إجرامية',
    'المخالفات المرورية البسيطة',
    'المخالفات البيئية والصحية',
  ],
  commercial: [
    'نزاعات الشركات',
    'تأسيس الشركات',
    'تصفية الشركات',
    'نزاعات العقود التجارية',
    'نزاعات التوزيع والوكالة',
    'الإفلاس والتسوية القضائية',
  ],
  administrative: [
    'الطعون الإدارية',
    'المسؤولية الإدارية',
    'نزاعات العقود العامة',
  ],
  family: [
    'الزواج والتوثيق',
    'الطلاق',
    'النفقة والحضانة',
    'إثبات النسب',
    'الميراث والوصايا',
    'تعدد الزوجات',
    'الكفالة',
  ],
  labor: [
    'الفصل التعسفي',
    'مطالبات التعويض',
    'نزاعات الأجور والإجازات',
    'الإضرابات',
    'التفاوض الجماعي',
    'نزاعات الاتفاقيات الجماعية',
  ],
};

const CATEGORY_DISPLAY = {
  all: 'الكل',
  civil: 'القضاء المدني',
  criminal: 'القضاء الجنائي',
  commercial: 'القضاء التجاري',
  administrative: 'القضاء الإداري',
  family: 'قضاء الأسرة',
  labor: 'القضاء الاجتماعي',
};

const LegalCaseManagement = ({ setToken }) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  const [cases, setCases] = useState({
    civil: [],
    criminal: [],
    commercial: [],
    administrative: [],
    family: [],
    labor: [],
  });
  const [filteredCases, setFilteredCases] = useState({
    civil: [],
    criminal: [],
    commercial: [],
    administrative: [],
    family: [],
    labor: [],
  });
  const [selectedCase, setSelectedCase] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCaseLevel, setFilterCaseLevel] = useState(''); 
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState({
    civil: 1,
    criminal: 1,
    commercial: 1,
    administrative: 1,
    family: 1,
    labor: 1,
  });
  const [selectedCases, setSelectedCases] = useState([]);
  const [formData, setFormData] = useState({
    case_level: 'primary',
    primary_case_number: '',
    category: '',
    type: '',
    avocat_id: '',
    client_id: '',
    adversaire: '',
    statut: 'en cours',
    client_role: '',
    case_number: '',
    attachments: [],
    fee_type: '',
    lawyer_fees: '',
    case_expenses: '',
    paid_amount: '',
  });
  const [archiveRemarks, setArchiveRemarks] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [avocatId, setAvocatId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const casesPerPage = 5;
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [attachmentNames, setAttachmentNames] = useState([]); 
const isImage = ['jpg', 'jpeg', 'png'].includes(previewFile?.type?.toLowerCase());

const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 3));
const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.5));

  const statutDisplay = {
    'en cours': 'جارية',
    terminée: 'منتهية',
  };

  const roleDisplay = {
    plaignant: 'مدعي',
    défendeur: 'مدعى عليه',
  };
  const getDisplayedCases = (category) => {
    if (category === 'all') {
      return Object.values(filteredCases).flat();
    }
    return filteredCases[category] || [];
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
      }
    } else {
      setError('لم يتم العثور على رمز المصادقة');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (avocatId) {
      fetchCases();
      fetchClients();
    }
  }, [avocatId]);

  const fetchCases = async () => {
    if (!avocatId) return;
    try {
      setLoading(true);
      const newCases = {};
      for (const category of Object.keys(CASE_TYPES)) {
        const response = await axios.get(`${API_URL}/category/${category}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        newCases[category] = response.data;
      }
      setCases(newCases);
      setFilteredCases(newCases);
    } catch (error) {
      if (error.response?.status === 404) {
        const emptyCases = {};
        Object.keys(CASE_TYPES).forEach(category => {
          emptyCases[category] = [];
        });
        setCases(emptyCases);
        setFilteredCases(emptyCases);
      } else {
        setError('فشل جلب الملفات');
        console.error('Fetch cases error:', error.response?.data);
      }
    } finally {
      setLoading(false);
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
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await axios.get(CLIENTS_API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClients(response.data);
    } catch (error) {
      setError('فشل جلب بيانات الموكلين');
      console.error('Fetch clients error:', error.response?.data);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleFilter = (category) => {
    let filtered = cases[category];
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.client_id?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.adversaire?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((c) => c.statut === filterStatus);
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
    if (filterCaseLevel) {
      filtered = filtered.filter((c) => c.case_level === filterCaseLevel);
    }
    setFilteredCases(prev => ({ ...prev, [category]: filtered }));
    setCurrentPage(prev => ({ ...prev, [category]: 1 }));
  };

  const resetForm = () => {
    setFormData({
      case_level: 'primary',
      primary_case_number: '',
      category: '',
      type: '',
      avocat_id: '',
      client_id: '',
      adversaire: '',
      statut: 'en cours',
      client_role: '',
      case_number: '',
      attachments: [],
      fee_type: '',
      lawyer_fees: '',
      case_expenses: '',
      paid_amount: '',
    });
    setAttachmentFiles([]);
    setAttachmentNames([]); 
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.category || !formData.type || !formData.client_id || !formData.adversaire || !formData.client_role) {
    setError('جميع الحقول المطلوبة يجب ملؤها');
    toast.error('جميع الحقول المطلوبة يجب ملؤها');
    return;
  }
  if (formData.client_role === 'défendeur' && !formData.case_number) {
    setError('رقم الملف مطلوب للمدعى عليه');
    toast.error('رقم الملف مطلوب للمدعى عليه');
    return;
  }
  if (formData.case_level === 'appeal' && !formData.primary_case_number) {
    setError('رقم الملف الابتدائي مطلوب لملف استئنافي');
    toast.error('رقم الملف الابتدائي مطلوب لملف استئنافي');
    return;
  }
  if (!formData.fee_type) {
    setError('نوع الأتعاب مطلوب');
    toast.error('نوع الأتعاب مطلوب');
    return;
  }
  if (!formData.lawyer_fees || isNaN(parseFloat(formData.lawyer_fees))) {
    setError('أتعاب المحامي مطلوبة ويجب أن تكون رقمًا صالحًا');
    toast.error('أتعاب المحامي مطلوبة ويجب أن تكون رقمًا صالحًا');
    return;
  }
  if (formData.fee_type === 'comprehensive' && (!formData.case_expenses || isNaN(parseFloat(formData.case_expenses)))) {
    setError('مصاريف القضية مطلوبة ويجب أن تكون رقمًا صالحًا للأتعاب الشاملة');
    toast.error('مصاريف القضية مطلوبة ويجب أن تكون رقمًا صالحًا للأتعاب الشاملة');
    return;
  }
  if (attachmentFiles.length > 0 && attachmentFiles.length !== attachmentNames.length) {
    setError('يرجى إدخال أسماء ل instaurيع المرفقات');
    toast.error('يرجى إدخال أسماء لجميع المرفقات');
    return;
  }
  if (attachmentNames.some((name) => !name.trim())) {
    setError('أسماء المرفقات يجب ألا تكون فارغة');
    toast.error('أسماء المرفقات يجب ألا تكون فارغة');
    return;
  }

  setSubmitting(true);
  const submitData = new FormData();

  submitData.append('case_level', formData.case_level);
  if (formData.case_level === 'appeal') {
    submitData.append('primary_case_number', formData.primary_case_number);
  }
  submitData.append('category', formData.category);
  submitData.append('type', formData.type);
  submitData.append('avocat_id', avocatId);
  submitData.append('client_id', formData.client_id);
  submitData.append('adversaire', formData.adversaire);
  submitData.append('statut', formData.statut);
  submitData.append('client_role', formData.client_role);
  if (formData.case_number) {
    submitData.append('case_number', formData.case_number);
  }
  submitData.append('fee_type', formData.fee_type);
  submitData.append('lawyer_fees', parseFloat(formData.lawyer_fees).toString());
  if (formData.fee_type === 'comprehensive' && formData.case_expenses) {
    submitData.append('case_expenses', parseFloat(formData.case_expenses).toString());
  }
  submitData.append('paid_amount', formData.paid_amount || '0');

  attachmentFiles.forEach((file) => {
    submitData.append('attachments', file);
  });
  if (attachmentNames.length > 0) {
    submitData.append('attachmentNames', JSON.stringify(attachmentNames));
  }

  if (formData.attachments?.length > 0) {
    submitData.append('existingAttachments', JSON.stringify(formData.attachments));
  }

  try {
    let response;
    if (editingId) {
      response = await axios.put(`${API_URL}/${editingId}`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCases((prev) => ({
        ...prev,
        [response.data.category]: prev[response.data.category].map((c) =>
          c._id === editingId ? response.data : c
        ),
      }));
      setFilteredCases((prev) => ({
        ...prev,
        [response.data.category]: prev[response.data.category].map((c) =>
          c._id === editingId ? response.data : c
        ),
      }));
      toast.success('تم تعديل الملف بنجاح');
    } else {
      response = await axios.post(API_URL, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCases((prev) => ({
        ...prev,
        [response.data.category]: [...prev[response.data.category], response.data],
      }));
      setFilteredCases((prev) => ({
        ...prev,
        [response.data.category]: [...prev[response.data.category], response.data],
      }));
      toast.success('تم إضافة الملف بنجاح');
    }
    resetForm();
    setAttachmentNames([]);
    setShowFormModal(false);
  } catch (error) {
    console.error('Error in handleSubmit:', error.response?.data);
    setError(error.response?.data?.message || 'حدث خطأ أثناء حفظ الملف');
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الملف');
  } finally {
    setSubmitting(false);
  }
};

  const handleEdit = (caseItem) => {
    setFormData({
      case_level: caseItem.case_level || 'primary',
      primary_case_number: caseItem.primary_case_number || '',
      category: caseItem.category || '',
      type: caseItem.type || '',
      avocat_id: caseItem.avocat_id?._id || '',
      client_id: caseItem.client_id?._id || '',
      adversaire: caseItem.adversaire || '',
      statut: caseItem.statut || 'en cours',
      client_role: caseItem.client_role || '',
      case_number: caseItem.case_number || '',
      attachments: caseItem.attachments || [],
      fee_type: caseItem.fee_type || '',
      lawyer_fees: caseItem.lawyer_fees || '',
      case_expenses: caseItem.case_expenses || '',
      paid_amount: caseItem.paid_amount || '',
    });
    setAttachmentFiles([]);
    setAttachmentNames([]); 
    setEditingId(caseItem._id);
    setShowFormModal(true);
  };

  const handleDelete = async (id, category) => {
  confirmToast('هل أنت متأكد من حذف هذا الملف؟', async () => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCases((prev) => ({
        ...prev,
        [category]: prev[category].filter((c) => c._id !== id),
      }));
      setFilteredCases((prev) => ({
        ...prev,
        [category]: prev[category].filter((c) => c._id !== id),
      }));
      setSelectedCases(selectedCases.filter((c) => c !== id));
      setError(null);
      toast.success('تم حذف الملف بنجاح');
    } catch (error) {
      setError('فشل حذف الملف');
      toast.error('فشل حذف الملف');
    }
  });
};

  const handleArchive = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      const response = await axios.put(
        `${API_URL}/${selectedCase._id}/archive`,
        { remarks: archiveRemarks },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setCases((prev) => ({
        ...prev,
        [selectedCase.category]: prev[selectedCase.category].filter((c) => c._id !== selectedCase._id),
      }));
      setFilteredCases((prev) => ({
        ...prev,
        [selectedCase.category]: prev[selectedCase.category].filter((c) => c._id !== selectedCase._id),
      }));
      setSelectedCases(selectedCases.filter((c) => c !== selectedCase._id));
      setShowArchiveModal(false);
      setArchiveRemarks('');
      setSelectedCase(null);
      toast.success('تم أرشفة الملف بنجاح');
    } catch (error) {
      console.error('Error archiving case:', error.response?.data);
      setError(error.response?.data?.message || 'فشل أرشفة الملف');
      toast.error(error.response?.data?.message || 'فشل أرشفة الملف');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async (category) => {
  confirmToast('هل أنت متأكد من حذف الملفات المحددة؟', async () => {
    try {
      await Promise.all(
        selectedCases.map((id) =>
          axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        )
      );
      setCases((prev) => ({
        ...prev,
        [category]: prev[category].filter((c) => !selectedCases.includes(c._id)),
      }));
      setFilteredCases((prev) => ({
        ...prev,
        [category]: prev[category].filter((c) => !selectedCases.includes(c._id)),
      }));
      setSelectedCases([]);
      setError(null);
      toast.success('تم حذف الملفات المحددة بنجاح');
    } catch (error) {
      setError('فشل حذف الملفات');
      toast.error('فشل حذف الملفات');
    }
  });
};

  const handleExport = (category) => {
  try {
    const headers = [
      'رقم الملف',
      'مستوى الملف',
      'رقم الملف الابتدائي',
      'الفئة',
      'النوع',
      'الحالة',
      'الدور',
      'المحامي',
      'الموكل',
      'الخصم',
      'تاريخ الإنشاء',
      'عدد المرفقات',
      'المرفقات',
      'نوع الأتعاب',
      'أتعاب المحامي',
      'أتعاب ومصاريف القضية',
      'المدفوع حاليًا',
    ];

    const casesToExport = getDisplayedCases(category);

    const data = casesToExport.map((row) => ({
      'رقم الملف': row.case_number || 'غير محدد',
      'مستوى الملف': row.case_level === 'primary' ? 'ملف ابتدائي' : row.case_level === 'appeal' ? 'ملف استئنافي' : 'غير محدد',
      'رقم الملف الابتدائي': row.case_level === 'appeal' ? row.primary_case_number || 'غير محدد' : '',
      'الفئة': CATEGORY_DISPLAY[row.category] || row.category,
      'النوع': row.type || 'غير محدد',
      'الحالة': statutDisplay[row.statut] || row.statut,
      'الدور': roleDisplay[row.client_role] || row.client_role,
      'المحامي': `${row.avocat_id?.nom || ''} ${row.avocat_id?.prenom || ''}`,
      'الموكل': row.client_id?.nom || 'غير محدد',
      'الخصم': row.adversaire || 'غير محدد',
      'تاريخ الإنشاء': new Date(row.date_creation).toLocaleDateString('fr-FR'),
      'عدد المرفقات': row.attachments ? row.attachments.length : 0,
      'المرفقات': (row.attachments || []).map(file => getFileName(file)).join('; '),
      'نوع الأتعاب': row.fee_type === 'comprehensive' ? 'شاملة' : row.fee_type === 'lawyer_only' ? 'محامي فقط' : 'غير محدد',
      'أتعاب المحامي': row.lawyer_fees || '0',
      'أتعاب ومصاريف القضية': row.case_expenses || '0',
      'المدفوع حاليًا': row.paid_amount || '0',
    }));

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cases');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(file, `cases_${category}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('تم تحميل الملف بنجاح');
  } catch (error) {
    console.error('Error exporting XLSX:', error);
    toast.error('فشل تحميل الملف');
  }
};

  const handleSort = (key, category) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sorted = [...filteredCases[category]].sort((a, b) => {
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
      } else if (key === 'adversaire') {
        aValue = a.adversaire || '';
        bValue = b.adversaire || '';
      } else if (key === 'date_creation') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (key === 'case_number' || key === 'client_role') {
        aValue = aValue || '';
        bValue = bValue || '';
      }
      if (typeof aValue === 'string' && key !== 'date_creation') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return direction === 'asc' ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
    });
    setFilteredCases(prev => ({ ...prev, [category]: sorted }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles((prev) => [...prev, ...files]);
    setAttachmentNames((prev) => [...prev, ...files.map(() => '')]); 
  };

  const handleRemoveAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    setAttachmentNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentsModal = (caseItem) => {
    setSelectedCase(caseItem);
    setAttachmentFiles([]);
    setShowAttachmentsModal(true);
  };
const handleAttachmentNameChange = (index, value) => {
    setAttachmentNames((prev) => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  };

  const handleAddAttachments = async (e) => {
    e.preventDefault();
    if (attachmentFiles.length === 0) {
      setError('يرجى اختيار ملفات لإضافتها');
      toast.error('يرجى اختيار ملفات لإضافتها');
      return;
    }
    if (attachmentFiles.length !== attachmentNames.length) {
      setError('يرجى إدخال أسماء لجميع المرفقات');
      toast.error('يرجى إدخال أسماء لجميع المرفقات');
      return;
    }
    if (attachmentNames.some(name => !name.trim())) {
      setError('أسماء المرفقات يجب ألا تكون فارغة');
      toast.error('أسماء المرفقات يجب ألا تكون فارغة');
      return;
    }
    setSubmitting(true);
    const submitData = new FormData();
    attachmentFiles.forEach((file) => {
      submitData.append('attachments', file);
    });
    submitData.append('attachmentNames', JSON.stringify(attachmentNames));
    try {
      const response = await axios.put(`${API_URL}/${selectedCase._id}/attachments`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setCases(prev => ({
        ...prev,
        [selectedCase.category]: prev[selectedCase.category].map((c) => (c._id === selectedCase._id ? response.data : c)),
      }));
      setFilteredCases(prev => ({
        ...prev,
        [selectedCase.category]: prev[selectedCase.category].map((c) => (c._id === selectedCase._id ? response.data : c)),
      }));
      setShowAttachmentsModal(false);
      setAttachmentFiles([]);
      setAttachmentNames([]); 
      setError(null);
      toast.success('تم إضافة المرفقات بنجاح');
    } catch (error) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء إضافة المرفقات');
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة المرفقات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAttachment = async (fileUrl, index) => {
  confirmToast('هل أنت متأكد من حذف هذا المرفق؟', async () => {
    try {
      const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0]; 
      await axios.delete(`${API_URL}/${editingId}/attachments/${encodeURIComponent(publicId)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFormData((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }));
      toast.success('تم حذف المرفق بنجاح');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setError(error.response?.data?.message || 'فشل حذف المرفق');
      toast.error(error.response?.data?.message || 'فشل حذف المرفق');
    }
  });
};


const handleDownloadAttachment = async (fileUrl, fileName) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token d'authentification manquant");

    const url = new URL(fileUrl);
    const segments = url.pathname.split('/');
    const uploadIndex = segments.findIndex((s) => s === 'upload');
    const versionIndex = uploadIndex + 1;

    const publicId = segments
      .slice(versionIndex + (segments[versionIndex].startsWith('v') ? 1 : 0))
      .join('/')
      .split('.')[0];

    console.log('📂 File URL:', fileUrl);
    console.log('📄 Extracted publicId:', publicId);

    const response = await axios.get(`${API_URL}/download/${encodeURIComponent(publicId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { signedUrl, fileName: serverFileName } = response.data;

    const sanitizedFileName = (fileName || serverFileName || 'document')
      .replace(/[<>"'/\\|?*]/g, '') 
      .trim();
    console.log('📥 Downloading with name:', sanitizedFileName);

    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = sanitizedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('✅ تم تحميل الملف بنجاح');
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement :', error);
    toast.error(error.response?.data?.message || 'فشل تحميل الملف. تحقق من الاتصال أو الرابط.');
  }
};



const handlePreviewAttachment = async (file, fileName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token d'authentification manquant");

      const url = new URL(file);
      const segments = url.pathname.split('/');
      const uploadIndex = segments.findIndex(s => s === 'upload');
      if (uploadIndex === -1 || !segments.includes('affaires')) {
        throw new Error('Invalid Cloudinary URL');
      }
      const versionIndex = uploadIndex + 1;
      const publicId = segments.slice(versionIndex + (segments[versionIndex].startsWith('v') ? 1 : 0)).join('/').split('.')[0];
      console.log('File URL:', file);
      console.log('Extracted publicId:', publicId);

      const response = await axios.get(`${API_URL}/preview/${encodeURIComponent(publicId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { signedUrl, fileType, fileName: serverFileName } = response.data;

      if (['pdf', 'jpg', 'jpeg', 'png'].includes(fileType)) {
        setPreviewFile({ url: signedUrl, type: fileType, name: fileName || serverFileName });
        setShowPreviewModal(true);
      } else {
        toast.error('لا يمكن معاينة هذا النوع de fichiers، يرجى تحميله');
        await handleDownloadAttachment(file, fileName || serverFileName);
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error(error.response?.data?.message || 'فشل معاينة الملف');
    }
  };

  const getFileName = (file) => {
    if (!file || (typeof file === 'string' && !file.startsWith('https://'))) {
      return 'غير معروف';
    }
    if (typeof file === 'string') {
      const segments = file.split('/');
      return segments[segments.length - 1].split('?')[0] || 'غير معروف';
    }
    return file.name || 'غير معروف';
  };



  const categoryOptions = Object.keys(CASE_TYPES).map(category => ({
    value: category,
    label: CATEGORY_DISPLAY[category],
  }));

  const typeOptions = formData.category
    ? CASE_TYPES[formData.category].map(type => ({
        value: type,
        label: type,
      }))
    : [];

  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: client.nom || 'غير محدد',
  }));

  const summary = {
    total: Object.values(cases).flat().length,
    inProgress: Object.values(cases).flat().filter((c) => c.statut === 'en cours').length,
    closed: Object.values(cases).flat().filter((c) => c.statut === 'terminée').length,
  };

  if (loading || loadingClients) {
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
          <Title>إدارة الملفات القانونية</Title>
          <ButtonGroup>
            {selectedCases.length > 0 && (
              <DeleteButton onClick={() => handleBulkDelete(activeTab)}>
                <FaTrash /> حذف المحدد ({selectedCases.length})
              </DeleteButton>
            )}
            <ActionButton onClick={() => handleExport(activeTab)}>
              <Download /> تحميل
            </ActionButton>
            <ActionButton onClick={() => setShowFormModal(true)}>
              <Plus /> إضافة ملف
            </ActionButton>
            <ActionButton onClick={() => navigate('/case-archives')}>
              <FaArchive /> عرض الأرشيف
            </ActionButton>
          </ButtonGroup>
        </HeaderSection>
        <SummarySection>
          <SummaryCard whileHover={{ scale: 1.02 }}>
            <SummaryIconWrapper bgColor="#e6f3e9">
              <FileText className="h-6 w-6 text-green-600" />
            </SummaryIconWrapper>
            <SummaryText>
              <SummaryTitle>إجمالي الملفات</SummaryTitle>
              <SummaryValue>{summary.total}</SummaryValue>
            </SummaryText>
          </SummaryCard>
          <SummaryCard whileHover={{ scale: 1.02 }}>
            <SummaryIconWrapper bgColor="#fefcbf">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </SummaryIconWrapper>
            <SummaryText>
              <SummaryTitle>الملفات الجارية</SummaryTitle>
              <SummaryValue>{summary.inProgress}</SummaryValue>
            </SummaryText>
          </SummaryCard>
          {/* <SummaryCard whileHover={{ scale: 1.02 }}>
            <SummaryIconWrapper bgColor="#d1fae5">
              <User className="h-6 w-6 text-green-600" />
            </SummaryIconWrapper>
            <SummaryText>
              <SummaryTitle>الملفات المنتهية</SummaryTitle>
              <SummaryValue>{summary.closed}</SummaryValue>
            </SummaryText>
          </SummaryCard> */}
        </SummarySection>
        <FiltersSection>
          <SearchWrapper>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilter(activeTab);
              }}
              placeholder="البحث حسب الموكل أو الخصم أو رقم الملف..."
            />
            <SearchIcon />
          </SearchWrapper>
          <DatePicker
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              handleFilter(activeTab);
            }}
          />
          <FilterSelect
            value={filterCaseLevel}
            onChange={(e) => {
              setFilterCaseLevel(e.target.value);
              handleFilter(activeTab);
            }}
          >
            <option value="">الكل</option>
            <option value="primary">ملف ابتدائي</option>
            <option value="appeal">ملف استئنافي</option>
          </FilterSelect>
        </FiltersSection>
        <TabsWrapper>
          {['all', ...Object.keys(CASE_TYPES)].map(category => (
            <Tab
              key={category}
              active={activeTab === category}
              onClick={() => setActiveTab(category)}
            >
              {CATEGORY_DISPLAY[category]}
            </Tab>
          ))}
        </TabsWrapper>
        <CasesTable>
          <TableWrapper>
            <thead>
              <tr>
                <TableHeader>
                  <Checkbox
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedCases(
                        e.target.checked
                          ? getDisplayedCases(activeTab).map((c) => c._id)
                          : []
                      )
                    }
                    checked={
                      selectedCases.length === getDisplayedCases(activeTab).length &&
                      getDisplayedCases(activeTab).length > 0
                    }
                  />
                </TableHeader>
                <TableHeader>
                  رقم الملف
                  
                </TableHeader>
                <TableHeader>
                  النوع
                  
                </TableHeader>
                <TableHeader>
                  الموكل
                  
                </TableHeader>
                <TableHeader>
                  الخصم
                  
                </TableHeader>
                <TableHeader>
                  الدور
                  
                </TableHeader>
                <TableHeader>
                  تاريخ الإنشاء
                  
                </TableHeader>
                <TableHeader>المرفقات</TableHeader>
                <TableHeader>الإجراءات</TableHeader>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {getDisplayedCases(activeTab)
                  .slice(
                    ((currentPage[activeTab] || 1) - 1) * casesPerPage,
                    (currentPage[activeTab] || 1) * casesPerPage
                  )
                  .map((caseItem) => (
                    <TableRow
                      key={caseItem._id}
                      as={motion.tr}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        <Checkbox
                          type="checkbox"
                          checked={selectedCases.includes(caseItem._id)}
                          onChange={(e) => {
                            setSelectedCases((prev) =>
                              e.target.checked
                                ? [...prev, caseItem._id]
                                : prev.filter((id) => id !== caseItem._id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>{caseItem.case_number || 'غير محدد'}</TableCell>
                      <TableCell>{caseItem.type || 'غير محدد'}</TableCell>
                      <TableCell>{caseItem.client_id?.nom || 'غير محدد'}</TableCell>
                      <TableCell>{caseItem.adversaire || 'غير محدد'}</TableCell>
                      <TableCell>{roleDisplay[caseItem.client_role] || caseItem.client_role}</TableCell>
                      <TableCell>
                        {new Date(caseItem.date_creation).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {caseItem.attachments ? caseItem.attachments.length : 0}
                      </TableCell>
                      <TableCell>
                        <ActionIcons>
                          <ActionIcon
                            bgColor={theme.primary}
                            hoverColor={theme.primaryDark}
                            title="عرض"
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setShowDetailsModal(true);
                            }}
                          >
                            <FaEye />
                          </ActionIcon>
                          <ActionIcon
                            bgColor="#3b82f6"
                            hoverColor="#2563eb"
                            title="تعديل"
                            onClick={() => handleEdit(caseItem)}
                          >
                            <FaEdit />
                          </ActionIcon>
                          <ActionIcon
                            bgColor={theme.error}
                            hoverColor="#dc2626"
                            title="حذف"
                            onClick={() => handleDelete(caseItem._id, caseItem.category)}
                          >
                            <FaTrash />
                          </ActionIcon>
                          <ActionIcon
                            bgColor="#8b5cf6"
                            hoverColor="#7c3aed"
                            title="إضافة مرفقات"
                            onClick={() => handleAttachmentsModal(caseItem)}
                          >
                            <Paperclip />
                          </ActionIcon>
                          <ActionIcon
                            bgColor="#f59e0b"
                            hoverColor="#d97706"
                            title="أرشفة"
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setShowArchiveModal(true);
                            }}
                          >
                            <FaArchive />
                          </ActionIcon>
                        </ActionIcons>
                      </TableCell>
                    </TableRow>
                  ))}
              </AnimatePresence>
            </tbody>
          </TableWrapper>
          {getDisplayedCases(activeTab).length === 0 && (
            <div className="text-center py-6 text-gray-500">
              لا توجد ملفات لهذه الفئة
            </div>
          )}
          {getDisplayedCases(activeTab).length > 0 && (
            <Pagination>
              <PageButton
                onClick={() =>
                  setCurrentPage((prev) => ({
                    ...prev,
                    [activeTab]: (prev[activeTab] || 1) - 1,
                  }))
                }
                disabled={(currentPage[activeTab] || 1) === 1}
              >
                السابق
              </PageButton>
              {Array.from(
                { length: Math.ceil(getDisplayedCases(activeTab).length / casesPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <PageButton
                  key={page}
                  active={(currentPage[activeTab] || 1) === page}
                  onClick={() =>
                    setCurrentPage((prev) => ({
                      ...prev,
                      [activeTab]: page,
                    }))
                  }
                >
                  {page}
                </PageButton>
              ))}
              <PageButton
                onClick={() =>
                  setCurrentPage((prev) => ({
                    ...prev,
                    [activeTab]: (prev[activeTab] || 1) + 1,
                  }))
                }
                disabled={
                  (currentPage[activeTab] || 1) ===
                  Math.ceil(getDisplayedCases(activeTab).length / casesPerPage)
                }
              >
                التالي
              </PageButton>
            </Pagination>
          )}
        </CasesTable>
        {/* Modals inchangés */}
        <AnimatePresence>
{showFormModal && (
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
        <ModalTitle>{editingId ? 'تعديل ملف' : 'إضافة ملف جديد'}</ModalTitle>
        <CloseButton onClick={() => setShowFormModal(false)}>
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
      <ModalForm onSubmit={handleSubmit}>
        <FormGrid>
          <FormField>
            <FormLabel>مستوى الملف *</FormLabel>
            <FilterSelect
              value={formData.case_level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  case_level: e.target.value,
                  primary_case_number: e.target.value === 'primary' ? '' : prev.primary_case_number,
                }))
              }
              required
            >
              <option value="primary">ملف ابتدائي</option>
              <option value="appeal">ملف استئنافي</option>
            </FilterSelect>
          </FormField>
          {formData.case_level === 'appeal' && (
            <FormField>
              <FormLabel>رقم الملف الابتدائي *</FormLabel>
              <FormInput
                type="text"
                value={formData.primary_case_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primary_case_number: e.target.value,
                  }))
                }
                placeholder="أدخل رقم الملف الابتدائي"
                required
              />
            </FormField>
          )}
          <FormField>
            <FormLabel>الفئة *</FormLabel>
            <Select
              options={categoryOptions}
              value={categoryOptions.find((opt) => opt.value === formData.category)}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  category: option.value,
                  type: '',
                }))
              }
              placeholder="اختر الفئة..."
              styles={selectStyles}
              isSearchable
            />
          </FormField>
          <FormField>
            <FormLabel>النوع *</FormLabel>
            <Select
              options={typeOptions}
              value={typeOptions.find((opt) => opt.value === formData.type)}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  type: option.value,
                }))
              }
              placeholder="اختر النوع..."
              styles={selectStyles}
              isSearchable
              isDisabled={!formData.category}
            />
          </FormField>
          <FormField>
            <FormLabel>الموكل *</FormLabel>
            <Select
              options={clientOptions}
              value={clientOptions.find((opt) => opt.value === formData.client_id)}
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  client_id: option.value,
                }))
              }
              placeholder="اختر الموكل..."
              styles={selectStyles}
              isSearchable
            />
          </FormField>
          <FormField>
            <FormLabel>الخصم *</FormLabel>
            <FormInput
              type="text"
              value={formData.adversaire}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  adversaire: e.target.value,
                }))
              }
              placeholder="أدخل اسم الخصم"
              required
            />
          </FormField>
          <FormField>
            <FormLabel>الدور *</FormLabel>
            <FilterSelect
              value={formData.client_role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  client_role: e.target.value,
                }))
              }
              required
            >
              <option value="">اختر الدور...</option>
              <option value="plaignant">مدعي</option>
              <option value="défendeur">مدعى عليه</option>
            </FilterSelect>
          </FormField>
          <FormField>
            <FormLabel>رقم الملف {formData.client_role === 'défendeur' ? '*' : ''}</FormLabel>
            <FormInput
              type="text"
              value={formData.case_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  case_number: e.target.value,
                }))
              }
              placeholder="أدخل رقم الملف"
              required={formData.client_role === 'défendeur'}
            />
          </FormField>
          <FormField>
            <FormLabel>نوع الأتعاب *</FormLabel>
            <FilterSelect
              value={formData.fee_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fee_type: e.target.value,
                  lawyer_fees: '',
                  case_expenses: '',
                  paid_amount: '',
                }))
              }
              required
            >
              <option value="">اختر نوع الأتعاب...</option>
              <option value="comprehensive">اتعاب شاملة</option>
              <option value="lawyer_only">اتعاب محامي فقط</option>
            </FilterSelect>
          </FormField>
          <FormField>
            <FormLabel>أتعاب خاصة بالمحامي *</FormLabel>
            <FormInput
              type="number"
              value={formData.lawyer_fees}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lawyer_fees: e.target.value,
                }))
              }
              placeholder="أدخل أتعاب المحامي"
              required={formData.fee_type !== ''}
              disabled={formData.fee_type === ''}
            />
          </FormField>
          {formData.fee_type === 'comprehensive' && (
            <FormField>
              <FormLabel>اتعاب ومصاريف القضية *</FormLabel>
              <FormInput
                type="number"
                value={formData.case_expenses}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    case_expenses: e.target.value,
                  }))
                }
                placeholder="أدخل أتعاب ومصاريف القضية"
                required
              />
            </FormField>
          )}
          <FormField>
            <FormLabel>المدفوع حاليًا *</FormLabel>
            <FormInput
              type="text"
              value={editingId && selectedCase ? selectedCase.total_paid_amount || '0' : '0'}
              disabled
            />
          </FormField>
        </FormGrid>
        <FileInputWrapper>
            <FormLabel>المرفقات</FormLabel>
            <FileInput
              type="file"
              multiple
              id="fileInput"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx" 
            />
            <CustomFileButton
              type="button"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Paperclip size={16} />
              اختر الملفات
            </CustomFileButton>
            {attachmentFiles.length > 0 && (
              <FileList>
                {attachmentFiles.map((file, index) => (
                  <FileItem key={index}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                      <AttachmentTag>
                        {file.name}
                        <RemoveAttachmentButton
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <FaTimes />
                        </RemoveAttachmentButton>
                      </AttachmentTag>
                      <AttachmentNameInput
                        type="text"
                        value={attachmentNames[index] || ''}
                        onChange={(e) => handleAttachmentNameChange(index, e.target.value)}
                        placeholder="أدخل اسم المرفق"
                        required
                      />
                    </div>
                  </FileItem>
                ))}
              </FileList>
            )}
          </FileInputWrapper>
        {editingId && formData.attachments?.length > 0 && (
          <FileInputWrapper>
            <FormLabel>المرفقات الحالية</FormLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.attachments
                .filter(file => typeof file === 'object' && file.url && file.name)
                .map((file, index) => (
                  <AttachmentTag key={index}>
                  {file.name}
                  <RemoveAttachmentButton
                    type="button"
                    onClick={() => handleDeleteAttachment(file.url, index)} 
                  >
                    <FaTimes />
                  </RemoveAttachmentButton>
                </AttachmentTag>
                ))}
            </div>
          </FileInputWrapper>
        )}
        <SubmitButton type="submit" disabled={submitting}>
          {submitting
            ? 'جارٍ الحفظ...'
            : editingId
            ? 'حفظ التعديلات'
            : 'إضافة الملف'}
        </SubmitButton>
      </ModalForm>
    </ModalContent>
  </ModalOverlay>
)}
          {showDetailsModal && selectedCase && (
  <ModalOverlay
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <ModalContent
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ModalHeader>
        <ModalTitle>تفاصيل الملف</ModalTitle>
        <CloseButton onClick={() => setShowDetailsModal(false)}>
          <FaTimes />
        </CloseButton>
      </ModalHeader>
      <ModalGrid>
        <DetailItem>
          <DetailLabel>رقم الملف</DetailLabel>
          <DetailValue>{selectedCase.case_number || 'غير محدد'}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>الموكل</DetailLabel>
          <DetailValue>{selectedCase.client_id?.nom || 'غير محدد'}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>الخصم</DetailLabel>
          <DetailValue>{selectedCase.adversaire}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>الحالة</DetailLabel>
          <DetailValue>{statutDisplay[selectedCase.statut] || selectedCase.statut}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>الدور</DetailLabel>
          <DetailValue>{roleDisplay[selectedCase.client_role] || selectedCase.client_role}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>الفئة</DetailLabel>
          <DetailValue>{CATEGORY_DISPLAY[selectedCase.category] || selectedCase.category}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>النوع</DetailLabel>
          <DetailValue>{selectedCase.type}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>المستوى</DetailLabel>
          <DetailValue>{selectedCase.case_level === 'primary' ? 'ابتدائي' : 'استئنافي'}</DetailValue>
        </DetailItem>
        {selectedCase.case_level === 'appeal' && (
          <DetailItem>
            <DetailLabel>رقم الملف الابتدائي</DetailLabel>
            <DetailValue>{selectedCase.primary_case_number}</DetailValue>
          </DetailItem>
        )}
        <DetailItem>
          <DetailLabel>أتعاب المحامي</DetailLabel>
          <DetailValue>{selectedCase.lawyer_fees} دج</DetailValue>
        </DetailItem>
        {selectedCase.fee_type === 'comprehensive' && (
          <DetailItem>
            <DetailLabel>مصاريف القضية</DetailLabel>
            <DetailValue>{selectedCase.case_expenses} دج</DetailValue>
          </DetailItem>
        )}
        <DetailItem>
          <DetailLabel>المبلغ المدفوع</DetailLabel>
          <DetailValue>{selectedCase.total_paid_amount || 0} دج</DetailValue>
        </DetailItem>
      </ModalGrid>
      {selectedCase.attachments?.length > 0 && (
        <>
          <DetailLabel>المرفقات</DetailLabel>
          <AttachmentList>
            {selectedCase.attachments.map((file, index) => (
              <AttachmentItem key={index}>
                <span>{getFileName(file)}</span>
                <ActionIcons>
                  <ActionIcon
                    bgColor={theme.primary}
                    hoverColor={theme.primaryDark}
                    title="معاينة"
                    onClick={() => handlePreviewAttachment(typeof file === 'object' ? file.url : file, typeof file === 'object' ? file.name : undefined)}
                  >
                    <FaEye />
                  </ActionIcon>
                  <ActionIcon
                    bgColor={theme.secondary}
                    hoverColor="#4b5563"
                    title="تحميل"
                    onClick={() => handleDownloadAttachment(typeof file === 'object' ? file.url : file, typeof file === 'object' ? file.name : undefined)}
                  >
                    <DownloadIcon />
                  </ActionIcon>
                </ActionIcons>
              </AttachmentItem>
            ))}
          </AttachmentList>
        </>
      )}
    </ModalContent>
  </ModalOverlay>
)}
          {showAttachmentsModal && selectedCase && (
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
                  <ModalTitle>إضافة مرفقات</ModalTitle>
                  <CloseButton onClick={() => setShowAttachmentsModal(false)}>
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
                <ModalForm onSubmit={handleAddAttachments}>
                  <FileInputWrapper>
                    <FormLabel>اختر المرفقات</FormLabel>
                    <FileInput
                      type="file"
                      multiple
                      id="attachmentFileInput"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <CustomFileButton
                      type="button"
                      onClick={() => document.getElementById('attachmentFileInput').click()}
                    >
                      <Paperclip size={16} />
                      اختر الملفات
                    </CustomFileButton>
                    {attachmentFiles.length > 0 && (
                      <FileList>
                        {attachmentFiles.map((file, index) => (
                          <FileItem key={index}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                              <AttachmentTag>
                                {file.name}
                                <RemoveAttachmentButton
                                  type="button"
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <FaTimes />
                                </RemoveAttachmentButton>
                              </AttachmentTag>
                              <AttachmentNameInput
                                type="text"
                                value={attachmentNames[index] || ''}
                                onChange={(e) => handleAttachmentNameChange(index, e.target.value)}
                                placeholder="أدخل اسم المرفق"
                                required
                              />
                            </div>
                          </FileItem>
                        ))}
                      </FileList>
                    )}
                  </FileInputWrapper>
                  {selectedCase.attachments?.length > 0 && (
                    <FileInputWrapper>
                      <FormLabel>المرفقات الحالية</FormLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedCase.attachments.map((file, index) => (
                          <AttachmentTag key={index}>
                            {getFileName(file)}
                          </AttachmentTag>
                        ))}
                      </div>
                    </FileInputWrapper>
                  )}
                  <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? 'جارٍ الإضافة...' : 'إضافة المرفقات'}
                  </SubmitButton>
                </ModalForm>
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
          <ZoomButtonContainer>
            <ZoomButton onClick={handleZoomOut}>
              <span />
              <FaMinus />
            </ZoomButton>
            <ZoomButton onClick={handleZoomIn}>
              <span />
              <FaPlus />
            </ZoomButton>
          </ZoomButtonContainer>
        )}
        <CloseButton
          onClick={() => {
            setShowPreviewModal(false);
            setPreviewFile(null);
          }}
        >
          <FaTimes />
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
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`}
              title="Office File Preview"
              className="w-full h-[80vh] rounded-md"
              frameBorder="0"
            />
          );
        } else {
          return (
            <div className="text-center text-red-600 font-semibold p-4">
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

      <div className="flex justify-between p-4">
        <SubmitButton
          type="button"
          onClick={() => {
            setShowPreviewModal(false);
            setPreviewFile(null);
          }}
        >
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
          {showArchiveModal && selectedCase && (
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
                  <ModalTitle>أرشفة الملف</ModalTitle>
                  <CloseButton onClick={() => setShowArchiveModal(false)}>
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
                <ModalForm onSubmit={handleArchive}>
                  <FormField>
                    <FormLabel>ملاحظات الأرشفة</FormLabel>
                    <FormTextarea
                      value={archiveRemarks}
                      onChange={(e) => setArchiveRemarks(e.target.value)}
                      placeholder="أدخل ملاحظات الأرشفة (اختياري)"
                    />
                  </FormField>
                  <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? 'جارٍ الأرشفة...' : 'أرشفة الملف'}
                  </SubmitButton>
                </ModalForm>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </MainContent>
    </Container>
    );
};

export default LegalCaseManagement;


