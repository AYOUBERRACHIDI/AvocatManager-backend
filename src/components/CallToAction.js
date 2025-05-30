import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
`;

const Section = styled.section`
  padding: 6rem 1.5rem;
  background: radial-gradient(ellipse at center, #123c2a, #057a55, #000000); /* from-emerald-900 via-emerald-600 to-black */
  position: relative;
  overflow: hidden;
  text-align: center;
  direction: rtl;
  animation: ${css`${zoomIn} 1s ease-in-out forwards`};

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1), transparent 70%);
    z-index: 0;
  }

  @media (min-width: 768px) {
    padding: 8rem 4rem;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #ffffff; /* White text for contrast on dark gradient */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  animation: ${css`${fadeIn} 1s ease-in-out forwards 0.2s`}; /* Delay to sync with zoomIn */
  position: relative;
  z-index: 1;

  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background: linear-gradient(to right, #facc15, #ffffff);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  }

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  color: #f3f4f6; /* Light gray for contrast on dark gradient */
  margin-bottom: 3rem;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
  animation: ${css`${fadeIn} 1s ease-in-out forwards 0.4s`}; /* Delay to sync with zoomIn */
  z-index: 1;
  position: relative;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CallToActionButton = styled(Link)`
  display: inline-block;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(to right, #facc15, #fef08a); /* Yellow gradient for button */
  color: #123c2a; /* Dark green text for contrast */
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  animation: ${css`${fadeIn} 1s ease-in-out forwards 0.6s`}; /* Delay to sync with zoomIn */
  z-index: 1;

  &:hover {
    background: linear-gradient(to right, #fef08a, #facc15);
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.7);
    transform: translateY(-2px);
  }

  &:active {
    animation: ${pulse} 0.5s ease-in-out;
  }

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: #ffffff;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    animation: ${pulse} 1s ease-in-out;
  }

  &:hover:after {
    opacity: 0.3;
  }

  @media (min-width: 768px) {
    padding: 1.5rem 3rem;
    font-size: 1.25rem;
  }
`;

function CallToAction() {
  return (
    <Section>
      <Title>جاهز لتبسيط عملك القانوني؟</Title>
      <Subtitle>انضم إلى قضيتك اليوم واستمتع بإدارة مكتب محاماة أكثر كفاءة.</Subtitle>
      <CallToActionButton to="/register">سجل الآن</CallToActionButton>
    </Section>
  );
}

export default CallToAction;