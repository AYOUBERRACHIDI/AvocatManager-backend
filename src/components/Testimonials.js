import React from 'react';
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

const scalePulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(46, 125, 50, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px rgba(46, 125, 50, 0.3);
  }
`;

const Section = styled.section`
  padding: 4rem 1.5rem;
  background-color: #f8fafc;
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
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid transparent;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 255, 240, 0.7));
    border-image: linear-gradient(to right, #2e7d32, #facc15) 1;
  }
`;

const TestimonialImage = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 10px rgba(46, 125, 50, 0.3);
  animation: ${scalePulse} 2s ease-in-out infinite;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const Quote = styled.p`
  color: #6b7280; /* Gray for quote */
  font-style: italic;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1rem;
`;

const Name = styled.span`
  font-weight: 600;
  color: #1f2937; /* Black for name */
  font-size: 1rem;
`;

function Testimonials() {
  const testimonials = [
    {
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      quote: "قضيتك غيرت ممارستي! أصبحت إدارة القضايا أكثر سهولة وتنظيمًا.",
      name: "أحمد علي، محامي",
    },
    {
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpRdKfDZTLpyD9BqYkDx2mLBzHn6Lts4ATbA&s",
      quote: "منصة رائعة! ساعدتني في تنظيم مواعيدي وتواصلي مع العملاء بأمان.",
      name: "مريم الصغير، محامية",
    },
    {
      image: "https://img.kooora.com/?i=o%2Fp%2F58%2F312%2Fzakaria-hadraf-1.png",
      quote: "ضروري لكل مكتب محاماة. واجهة سهلة وميزات قوية.",
      name: "زكريا حدراف، محامي",
    },
  ];

  return (
    <Section>
      <Title>ماذا يقول عملاؤنا؟</Title>
      <Grid>
        {testimonials.map((testimonial, index) => (
          <Card key={index} delay={index * 0.2}>
            <TestimonialImage src={testimonial.image} alt={testimonial.name} />
            <Quote>"{testimonial.quote}"</Quote>
            <Name>{testimonial.name}</Name>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

export default Testimonials;