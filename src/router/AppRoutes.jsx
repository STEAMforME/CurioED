// src/router/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../views/Home/Home';
import EducatorDashboard from '../views/Educator/EducatorDashboard';
import ParentDashboard from '../views/Parent/ParentDashboard';
import StudentDashboard from '../views/Student/StudentDashboard';
import Goals from '../views/Student/Goals';
import Assistant from '../views/Student/Assistant';
import Insights from '../views/Parent/Insight';
import Messages from '../views/Parent/Messages';
import Class from '../views/Educator/Class';
import AIAssist from '../views/Educator/AIAssist';
import NotFound from '../views/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/goals" element={<Goals />} />
      <Route path="/student/assistant" element={<Assistant />} />
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/parent/insights" element={<Insights />} />
      <Route path="/parent/messages" element={<Messages />} />
      <Route path="/educator" element={<EducatorDashboard />} />
      <Route path="/educator/class" element={<Class />} />
      <Route path="/educator/ai" element={<AIAssist />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
