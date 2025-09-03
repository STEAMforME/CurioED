// src/App.jsx

import React from 'react';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';
import AppRoutes from './router/AppRoutes';

const App = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <MainContent>
        <AppRoutes />
      </MainContent>
    </div>
  );
};

export default App;
