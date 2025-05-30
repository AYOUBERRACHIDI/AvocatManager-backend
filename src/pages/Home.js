import React from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const MainContainer = styled.div`
  padding-top: 5rem; 
`;

function Home() {
  return (
    <MainContainer>
      <Navbar />
      
      <div id="home">
        <Hero />
      </div>

      <div id="features">
        <Features />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="about">
        <WhyChooseUs />
      </div>

      <div id="contact">
        <ContactForm />
      </div>

      <CallToAction />
      <Footer />
    </MainContainer>
  );
}

export default Home;