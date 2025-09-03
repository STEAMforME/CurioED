// src/layout/MainContent.jsx

import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main style={{ flex: 1, padding: '1rem' }}>
      {children}
    </main>
  );
};

export default MainContent;
