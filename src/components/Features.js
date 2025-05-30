import React from 'react';
import { ScaleIcon, LockClosedIcon, CalendarIcon } from '@heroicons/react/24/outline';
import styled, { keyframes } from 'styled-components';

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

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

const Section = styled.section`
  padding: 4rem 1.5rem;
  background: #f8fafc; /* Slightly off-white background */
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 5rem 4rem;
  }
`;

const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(to right, #2e7d32, #4ade80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  animation: ${fadeIn} 1s ease-in-out forwards;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease-in-out;
  animation: ${fadeInUp} 0.8s ease-in-out forwards;
  animation-delay: ${props => props.delay}s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid transparent;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 255, 240, 0.7));
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937; /* Black for title */
  margin-bottom: 0.75rem;
`;

const CardDescription = styled.p`
  color: #6b7280; /* Gray for description */
  text-align: center;
  font-size: 1rem;
`;

const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 3rem;
`;

const Button = styled.button`
  position: relative;
  padding: 0.75rem 2rem;
  background: linear-gradient(to right, #2e7d32, #1a4d1e);
  color: #ffffff;
  font-weight: 600;
  border-radius: 9999px;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.5);
  transition: all 0.3s ease-in-out;
  animation: ${fadeIn} 1s ease-in-out forwards;
  overflow: hidden;

  &:hover {
    background: linear-gradient(to right, #1a4d1e, #2e7d32);
    box-shadow: 0 0 15px #facc15;
    transform: scale(1.05);
  }

  & > span {
    position: absolute;
    inset: 0;
    background: #facc15;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    animation: ${ripple} 1s ease-in-out;
  }

  &:hover > span {
    opacity: 0.3;
  }
`;

function Features() {
  const features = [
    {
      icon: <ScaleIcon className="w-12 h-12 text-qadiyatuk-green" />,
      title: "إدارة القضايا",
      description: "تنظيم وإدارة قضاياك بكفاءة مع أدوات متطورة.",
    },
    {
      icon: <LockClosedIcon className="w-12 h-12 text-qadiyatuk-green" />,
      title: "تواصل آمن",
      description: "تواصل مع عملائك بأمان تام وسرية مضمونة.",
    },
    {
      icon: <CalendarIcon className="w-12 h-12 text-qadiyatuk-green" />,
      title: "جدولة المواعيد",
      description: "إدارة مواعيدك بسهولة وتنظيم فعال.",
    },
  ];

  return (
    <Section>
      <Title>الميزات التي تجعل عملك أسهل</Title>
      <Grid>
        {features.map((feature, index) => (
          <Card key={index} delay={index * 0.2}>
            <IconWrapper>{feature.icon}</IconWrapper>
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </Card>
        ))}
      </Grid>
      <ButtonWrapper>
        <Button>
          <span />
          سجل الآن
        </Button>
      </ButtonWrapper>
    </Section>
  );
}

export default Features;