// src/router/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from '../views/Home/Home.jsx';
import EducatorDashboard from '../views/Educator/EducatorDashboard.jsx';
import ParentDashboard from '../views/Parent/ParentDashboard.jsx';
import StudentDashboard from '../views/Student/StudentDashboard.jsx';
import NotFound from '../views/NotFound.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/educator" element={<EducatorDashboard />} />
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
