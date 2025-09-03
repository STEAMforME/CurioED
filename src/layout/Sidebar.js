import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={{
      width: '200px',
      background: '#F1F5F9',
      padding: '1rem',
      height: '100vh',
      boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
    }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/">🏠 Home</Link></li>
          <li><Link to="/educator">👩‍🏫 Educator</Link></li>
          <li><Link to="/parent">👨‍👩‍👧‍👦 Parent</Link></li>
          <li><Link to="/student">🧑‍🎓 Student</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
