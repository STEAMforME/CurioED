const MainContent = ({ children }) => {
  return (
    <main style={{ padding: '2rem', background: '#FFF', flexGrow: 1 }}>
      {children}
    </main>
  );
};

export default MainContent;
