
import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="ml-64 p-4 bg-gray-100 min-h-screen">
      {children}
    </main>
  );
};

export default MainContent;
