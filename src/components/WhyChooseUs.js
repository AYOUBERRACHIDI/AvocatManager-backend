import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
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

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
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
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease-in-out;
  animation: ${fadeInUp} 0.8s ease-in-out forwards;
  animation-delay: ${props => props.delay}s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid transparent;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 255, 240, 0.7));
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  animation: ${pulse} 2s ease-in-out infinite;

  svg {
    transition: transform 0.3s ease-in-out;
  }

  &:hover svg {
    transform: scale(1.2);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937; /* Black for title */
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: #6b7280; /* Gray for description */
  font-size: 1rem;
`;

function WhyChooseUs() {
  const reasons = [
    { title: "واجهة سهلة الاستخدام", description: "تصميم بسيط وسهل يساعدك على التركيز على عملك." },
    { title: "أمان عالي المستوى", description: "حماية بياناتك وعملائك بأعلى معايير الأمان." },
    { title: "دعم مستمر", description: "فريق دعم متاح على مدار الساعة لمساعدتك." },
  ];

  return (
    <Section>
      <Title>لماذا تختار قضيتك؟</Title>
      <Grid>
        {reasons.map((reason, index) => (
          <Card key={index} delay={index * 0.2}>
            <IconWrapper>
              <CheckCircleIcon className="w-8 h-8 text-qadiyatuk-green" />
            </IconWrapper>
            <CardContent>
              <CardTitle>{reason.title}</CardTitle>
              <CardDescription>{reason.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

export default WhyChooseUs;