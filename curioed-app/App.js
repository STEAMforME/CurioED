
import React, { useState } from 'react';
import Navbar from '../curioed/layout/Navbar';
import Sidebar from '../curioed/layout/Sidebar';
import MainContent from '../curioed/layout/MainContent';
import ParentDashboard from '../curioed/public/views/Parent/ParentDashboard';
import StudentDashboard from '../curioed/public/views/Student/StudentDashboard';
import EducatorDashboard from '../curioed/public/views/Educator/EducatorDashboard';

function App() {
  const [role, setRole] = useState('parent');

  const renderDashboard = () => {
    switch (role) {
      case 'parent':
        return <ParentDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'educator':
        return <EducatorDashboard />;
      default:
        return <ParentDashboard />;
    }
  };

  return (
    <div className="font-sans">
      <Navbar />
      <Sidebar />
      <MainContent>
        <div className="mb-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="parent">Parent</option>
            <option value="student">Student</option>
            <option value="educator">Educator</option>
          </select>
        </div>
        {renderDashboard()}
      </MainContent>
    </div>
  );
}

export default App;
