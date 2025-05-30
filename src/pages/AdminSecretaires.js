import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled, { keyframes, css } from 'styled-components';
import Select from 'react-select';
import AdminLayout from './AdminLayout';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

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
  animation: ${fadeIn} 0.5s ease-in-out;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
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

const Td = styled.td`
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #374151;
  animation: ${slideIn} 0.4s ease-in-out;
  &:hover {
    background: rgba(74, 222, 128, 0.05);
  }
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 1rem;
  background: ${props => (props.active ? 'linear-gradient(to right, #2e7d32, #4ade80)' : '#ffffff')};
  color: ${props => (props.active ? 'white' : '#2e7d32')};
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(to right, #4ade80, #2e7d32);
    color: white;
    transform: translateY(-2px);
  }
  ${props =>
    props.active &&
    css`
      animation: ${pulse} 2s infinite;
    `}
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
  animation: ${fadeIn} 0.3s ease-in-out;
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
  animation: ${slideIn} 0.3s ease-in-out;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  grid-column: span 2;
  &:hover {
    background: linear-gradient(to right, #4ade80, #2e7d32);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const AddButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto 2rem;
  width: fit-content;
  padding: 0.75rem 1.5rem;
  & > svg {
    width: 20px;
    height: 20px;
  }
`;

const DeleteModal = styled(Modal)`
  max-width: 400px;
  max-height: 250px;
`;

const DeleteModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const DeleteMessage = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
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

function AdminSecretaires() {
  const navigate = useNavigate();
  const [secretaires, setSecretaires] = useState([]);
  const [avocats, setAvocats] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    ville: '',
    avocat_id: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const avocatOptions = avocats.map(avocat => ({
    value: avocat._id,
    label: `${avocat.nom} ${avocat.prenom}`,
  }));

  const fetchSecretaires = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires?page=${currentPage}&limit=5&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSecretaires(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('خطأ في جلب السكرتيرات: ' + (error.response?.data?.message || 'خطأ غير معروف'));
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchAvocats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/avocats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvocats(response.data.data);
    } catch (error) {
      toast.error('خطأ في جلب المحامين: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  useEffect(() => {
    fetchSecretaires();
    fetchAvocats();
  }, [currentPage, search, navigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvocatChange = selectedOption => {
    setFormData(prev => ({ ...prev, avocat_id: selectedOption ? selectedOption.value : '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = { ...formData };

      if (editingId) {
        await axios.put(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('تم تحديث السكرتير بنجاح');
      } else {
        await axios.post('http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('تم إنشاء السكرتير بنجاح');
      }

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '',
        adresse: '',
        ville: '',
        avocat_id: '',
      });
      setEditingId(null);
      setShowModal(false);
      fetchSecretaires();
    } catch (error) {
      toast.error('خطأ: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  const handleEdit = async id => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ ...response.data.data, password: '' });
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      toast.error('خطأ في جلب بيانات السكرتير: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://gestiondescabinets-backend-epg6dxcfhtbwbyac.canadacentral-01.azurewebsites.net:5000/api/admin/secretaires/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حذف السكرتير بنجاح');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchSecretaires();
    } catch (error) {
      toast.error('خطأ في الحذف: ' + (error.response?.data?.message || 'خطأ غير معروف'));
    }
  };

  const openAddModal = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      adresse: '',
      ville: '',
      avocat_id: '',
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openDeleteModal = id => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>إدارة السكرتيرات</Title>
        </Header>
        <AddButton onClick={openAddModal}>
          <PlusIcon />
          إضافة سكرتير
        </AddButton>
        <SearchContainer>
          <SearchInput
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم أو بريد إلكتروني"
          />
          <SearchIcon />
        </SearchContainer>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>الاسم</Th>
                <Th>البريد الإلكتروني</Th>
                <Th>الهاتف</Th>
                <Th>المدينة</Th>
                <Th>المحامي</Th>
                <Th>الإجراءات</Th>
              </tr>
            </thead>
            <tbody>
              {secretaires.map(secretaire => (
                <tr key={secretaire._id}>
                  <Td>{`${secretaire.nom} ${secretaire.prenom}`}</Td>
                  <Td>{secretaire.email}</Td>
                  <Td>{secretaire.telephone}</Td>
                  <Td>{secretaire.ville}</Td>
                  <Td>{secretaire.avocat_id ? `${secretaire.avocat_id.nom} ${secretaire.avocat_id.prenom}` : '-'}</Td>
                  <Td>
                    <ActionButton onClick={() => handleEdit(secretaire._id)}>
                      <PencilIcon />
                    </ActionButton>
                    <ActionButton onClick={() => openDeleteModal(secretaire._id)}>
                      <TrashIcon />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => (
            <PageButton
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </PageButton>
          ))}
        </Pagination>
      </Container>

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <ModalTitle>{editingId ? 'تعديل سكرتير' : 'إضافة سكرتير'}</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <XMarkIcon />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <div>
                  <InputWrapper>
                    <Label>الاسم</Label>
                    <Input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>اللقب</Label>
                    <Input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>كلمة المرور</Label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingId}
                    />
                  </InputWrapper>
                </div>
                <div>
                  <InputWrapper>
                    <Label>الهاتف</Label>
                    <Input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>العنوان</Label>
                    <Input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>المدينة</Label>
                    <Input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                  <InputWrapper>
                    <Label>المحامي</Label>
                    <Select
                      options={avocatOptions}
                      value={avocatOptions.find(option => option.value === formData.avocat_id) || null}
                      onChange={handleAvocatChange}
                      placeholder="اختر محامي"
                      isSearchable
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          background: '#ffffff',
                          fontSize: '0.875rem',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#2e7d32',
                          },
                          '&:focus-within': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.2)',
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          textAlign: 'right',
                        }),
                        option: (base, { isFocused }) => ({
                          ...base,
                          background: isFocused ? 'rgba(46, 125, 50, 0.1)' : '#ffffff',
                          color: '#374151',
                          '&:hover': {
                            background: 'rgba(46, 125, 50, 0.1)',
                          },
                        }),
                      }}
                    />
                  </InputWrapper>
                </div>
                <Button type="submit">{editingId ? 'تحديث' : 'إنشاء'}</Button>
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
              <DeleteMessage>هل أنت متأكد من حذف هذا السكرتير؟</DeleteMessage>
              <DeleteButtons>
                <Button onClick={handleDelete}>حذف</Button>
                <CancelButton onClick={() => setShowDeleteModal(false)}>إلغاء</CancelButton>
              </DeleteButtons>
            </DeleteModalBody>
          </DeleteModal>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
}

export default AdminSecretaires;