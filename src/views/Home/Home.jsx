// src/views/Home/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // optional custom styles

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo">🎓 CurioED</div>
        <nav className="home-nav">
          <button onClick={() => navigate('/about')}>About</button>
          <button onClick={() => navigate('/login')}>Login</button>
        </nav>
      </header>

      <section className="hero">
        <h1>✨ Welcome to CurioED</h1>
        <p>Your Learning Adventure Begins Here.</p>
        <div className="value-props">
          <span>🧠 Personalized Paths</span>
          <span>👨‍👩‍👧‍👦 Parent Engagement</span>
          <span>🎨 Curiosity First</span>
        </div>
      </section>

      <section className="user-buttons">
        <button onClick={() => navigate('/student')}>🚀 I'm a Student</button>
        <button onClick={() => navigate('/educator')}>🎓 I'm an Educator</button>
        <button onClick={() => navigate('/parent')}>👪 I'm a Parent</button>
      </section>

      <section className="testimonial">
        <blockquote>
          “CurioED helps students explore their passions through play, projects, and purpose.”
        </blockquote>
      </section>

      <footer className="home-footer">
        <a href="#contact">Contact</a>
        <a href="#support">Support</a>
        <a href="#terms">Terms</a>
      </footer>
    </div>
  );
};

export default Home;
 