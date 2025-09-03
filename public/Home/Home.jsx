// src/views/Home/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to CurioED</h1>
      <p>Your personalized K–12 homeschool and STEAM learning platform.</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Select your role:</h2>
        <ul style={{ lineHeight: '2' }}>
          <li><Link to="/educator">👩‍🏫 I'm an Educator</Link></li>
          <li><Link to="/parent">👨‍👩‍👧‍👦 I'm a Parent</Link></li>
          <li><Link to="/student">🧑‍🎓 I'm a Student</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
