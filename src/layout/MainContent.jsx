// src/layout/MainContent.jsx
import React from 'react';

const MainContent = ({ children }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {children}
    </div>
  );
};

export default MainContent;
