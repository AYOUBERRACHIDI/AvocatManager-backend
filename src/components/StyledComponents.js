import styled, { keyframes, css } from 'styled-components';
import { FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStickyNote, FaRedo } from 'react-icons/fa';

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

export const FormContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  direction: rtl;
`;

export const MainContent = styled.div`
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

export const FormSection = styled.div`
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

export const FormLeft = styled.div`
  flex: 3;
  padding: 0.75rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const FormRight = styled.div`
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

export const FormHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const Label = styled.label`
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

export const Input = styled.input`
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

export const Select = styled.select`
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

export const Textarea = styled.textarea`
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

export const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #d32f2f;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

export const AutocompleteContainer = styled.div`
  position: relative;
`;

export const AutocompleteList = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.25rem;
  padding: 0;
  list-style: none;
`;

export const AutocompleteItem = styled.li`
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #333333;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem;
  }
`;

export const FormButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const SaveButton = styled.button`
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

export const CancelButton = styled.button`
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

export const ResetButton = styled.button`
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

export const DeleteButton = styled.button`
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

export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

export const ModalHeader = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 1rem;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`;

export const ModalConfirmButton = styled.button`
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

export const ModalCancelButton = styled.button`
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

export const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ToggleSummary = styled.button`
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

export const SummaryContent = styled.div`
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    margin-top: 0.5rem;
  }
`;

export const SummaryText = styled.p`
  font-size: 0.75rem;
  color: #333333;
  margin: 0.5rem 0;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  gap: 0.5;
  `;
  export const DurationDisplay = styled.div`
  font-size: 0.75rem;
  color: #2e7d32;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;