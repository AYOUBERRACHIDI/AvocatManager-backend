import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled, { keyframes, css } from 'styled-components';
import { MagnifyingGlassIcon, ChevronRightIcon, ChevronLeftIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

import AdminLayout from './AdminLayout';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
`;

const Container = styled.div`
  padding: 2rem;
  direction: rtl;
  background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
  min-height: 100vh;
  animation: ${css`${fadeIn} 0.5s ease-in-out`};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #2e7d32;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 450px;
  margin: 0 auto 2rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: none;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-size: 1rem;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.3);
    background: rgba(255, 255, 255, 1);
  }
`;

const SearchIcon = styled(MagnifyingGlassIcon)`
  width: 20px;
  height: 20px;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  transition: color 0.3s ease;
  ${SearchInput}:focus + & {
    color: #2e7d32;
  }
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 1.25rem;
  text-align: right;
  background: linear-gradient(to bottom, #f1f5f9, #e5e7eb);
  color: #2e7d32;
  font-weight: 700;
  font-size: 0.95rem;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableCell = styled.td`
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #374151;
  animation: ${css`${slideIn} 0.4s ease-in-out`};
  &:hover {
    background: rgba(74, 222, 128, 0.05);
  }
`;

const MessageCell = styled(TableCell)`
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #2e7d32;
  margin-left: 0.75rem;
  transition: all 0.3s ease;
  &:hover {
    color: #facc15;
    transform: scale(1.1);
  }
  & > svg {
    width: 22px;
    height: 22px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 1rem;
  background: ${props => (props.active ? 'linear-gradient(to right, #2e7d32, #4ade80)' : '#ffffff')};
  color: ${props => (props.active ? 'white' : '#2e7d32')};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    background: linear-gradient(to right, #4ade80, #2e7d32);
    color: white;
    transform: translateY(-2px);
  }
  ${props => props.active && css`
    animation: ${pulse} 2s infinite;
  `}
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

const EmptyMessage = styled(LoadingMessage)`
  color: #ef4444;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${css`${fadeIn} 0.3s ease-in-out`};
`;

const Modal = styled.div`
  background: #ffffff;
  padding: 0;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  position: relative;
  animation: ${css`${slideIn} 0.3s ease-in-out`};
`;

const ModalHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #2e7d32;
    color: #ffffff;
    transform: rotate(90deg);
  }
  & > svg {
    width: 20px;
    height: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #ffffff;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #ffffff;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(to right, #4ade80, #2e7d32);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const DeleteModal = styled(Modal)`
  max-width: 400px;
  max-height: 250px;
`;

const ViewModal = styled(Modal)`
  max-width: 500px;
`;

const DeleteModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const ViewModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DeleteMessage = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2e7d32;
`;

const DetailValue = styled.p`
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-wrap; /* Preserve line breaks in message */
`;

const DeleteButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const CancelButton = styled(Button)`
  background: linear-gradient(to right, #6b7280, #4b5563);
  &:hover {
    background: linear-gradient(to right, #4b5563, #6b7280);
  }
`;

function Messages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyForm, setReplyForm] = useState({ subject: '', body: '' });
  const limit = 5; 

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchMessages = useCallback(async (pageNum, searchTerm) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit, search: searchTerm },
      });
      setMessages(response.data.data);
      setTotalPages(response.data.pages);
      setPage(response.data.page);
    } catch (error) {
      toast.error('خطأ في جلب الرسائل: ' + (error.response?.data?.message || 'خطأ غير معروف'));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleSearch = debounce((value) => {
    setSearch(value);
    setPage(1); 
    fetchMessages(1, value);
  }, 500);

  useEffect(() => {
    fetchMessages(page, search);
  }, [page, fetchMessages]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setReplyForm({ subject: `رد على رسالتك: ${message.message.substring(0, 20)}...`, body: '' });
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/messages/${selectedMessage._id}/reply`, replyForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم إرسال الرد بنجاح');
      setShowReplyModal(false);
      setReplyForm({ subject: '', body: '' });
      setSelectedMessage(null);
    } catch (error) {
      toast.error('خطأ في إرسال الرد: ' + (error.response?.data?.message || 'خطأ غير معروف'));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openDeleteModal = (message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/messages/${selectedMessage._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حذف الرسالة بنجاح');
      setShowDeleteModal(false);
      setSelectedMessage(null);
      fetchMessages(page, search); 
    } catch (error) {
      toast.error('خطأ في حذف الرسالة: ' + (error.response?.data?.message || 'خطأ غير معروف'));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openViewModal = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationButton
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    return pageNumbers;
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>الرسائل الواردة</Title>
        </Header>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="ابحث بالاسم، البريد، أو الرسالة..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <SearchIcon />
        </SearchContainer>
        <TableContainer>
          {isLoading ? (
            <LoadingMessage>جارٍ تحميل الرسائل...</LoadingMessage>
          ) : messages.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <TableHeader>الاسم</TableHeader>
                  <TableHeader>البريد الإلكتروني</TableHeader>
                  <TableHeader>الرسالة</TableHeader>
                  <TableHeader>التاريخ</TableHeader>
                  <TableHeader>الإجراءات</TableHeader>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id}>
                    <TableCell>{msg.name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <MessageCell title={msg.message}>
                      {msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : '')}
                    </MessageCell>
                    <TableCell>{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <ActionButton onClick={() => openViewModal(msg)}>
                        <EyeIcon />
                      </ActionButton>
                      <ActionButton onClick={() => openReplyModal(msg)}>
<ArrowUturnLeftIcon className="h-5 w-5 text-green-700 cursor-pointer" title="Répondre" />
                      </ActionButton>
                      <ActionButton onClick={() => openDeleteModal(msg)}>
                        <TrashIcon />
                      </ActionButton>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyMessage>لا توجد رسائل متاحة</EmptyMessage>
          )}
        </TableContainer>
        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </PaginationButton>
            {renderPageNumbers()}
            <PaginationButton
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </PaginationButton>
          </PaginationContainer>
        )}
      </Container>

      {showReplyModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <ModalTitle>رد على الرسالة</ModalTitle>
              <CloseButton onClick={() => setShowReplyModal(false)}>
                <XMarkIcon />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleReplySubmit}>
                <InputWrapper>
                  <Label>الموضوع</Label>
                  <Input
                    type="text"
                    value={replyForm.subject}
                    onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                    required
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>نص الرد</Label>
                  <Textarea
                    value={replyForm.body}
                    onChange={(e) => setReplyForm({ ...replyForm, body: e.target.value })}
                    required
                  />
                </InputWrapper>
                <Button type="submit">إرسال الرد</Button>
              </Form>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}

      {showDeleteModal && (
        <ModalOverlay>
          <DeleteModal>
            <ModalHeader>
              <ModalTitle>تأكيد الحذف</ModalTitle>
              <CloseButton onClick={() => setShowDeleteModal(false)}>
                <XMarkIcon />
              </CloseButton>
            </ModalHeader>
            <DeleteModalBody>
              <DeleteMessage>هل أنت متأكد من حذف هذه الرسالة؟</DeleteMessage>
              <DeleteButtons>
                <Button onClick={handleDelete}>حذف</Button>
                <CancelButton onClick={() => setShowDeleteModal(false)}>إلغاء</CancelButton>
              </DeleteButtons>
            </DeleteModalBody>
          </DeleteModal>
        </ModalOverlay>
      )}

      {showViewModal && (
        <ModalOverlay>
          <ViewModal>
            <ModalHeader>
              <ModalTitle>تفاصيل الرسالة</ModalTitle>
              <CloseButton onClick={() => setShowViewModal(false)}>
                <XMarkIcon />
              </CloseButton>
            </ModalHeader>
            <ViewModalBody>
              <DetailItem>
                <DetailLabel>الاسم</DetailLabel>
                <DetailValue>{selectedMessage.name}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>البريد الإلكتروني</DetailLabel>
                <DetailValue>{selectedMessage.email}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>الرسالة</DetailLabel>
                <DetailValue>{selectedMessage.message}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>التاريخ</DetailLabel>
                <DetailValue>{new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</DetailValue>
              </DetailItem>
            </ViewModalBody>
          </ViewModal>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
}

export default Messages;