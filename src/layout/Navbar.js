const Navbar = () => {
  return (
    <header style={{
      background: '#1E293B',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>CurioED</h1>
      <div>
        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Empowering Learning Everywhere</span>
      </div>
    </header>
  );
};

export default Navbar;
