// src/router/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../views/Home/Home';
import Login from '../views/Auth/Login';
import Signup from '../views/Auth/Signup';
import DashboardView from '../views/DashboardView';

// Role-specific dashboards
import AdminDashboard from '../views/Admin/AdminDashboard';
import PrincipalDashboard from '../views/Principal/PrincipalDashboard';
import SuperintendentDashboard from '../views/Superintendent/SuperintendentDashboard';
import InstructorDashboard from '../views/Instructor/InstructorDashboard';
import MentorDashboard from '../views/Mentor/MentorDashboard';
import EducatorDashboard from '../views/Educator/EducatorDashboard';
import ParentDashboard from '../views/Parent/ParentDashboard';

// Student views
import StudentDashboard from '../views/Student/StudentDashboard.tsx';
import Goals from '../views/Student/Goals.tsx';
import Assistant from '../views/Student/Assistant.tsx';
import Badges from '../views/Student/Badges.tsx';
import Projects from '../views/Student/Projects.tsx';
import Reflections from '../views/Student/Reflections.tsx';

// Other views
import Insights from '../views/Parent/Insight';
import Messages from '../views/Parent/Messages';
import Class from '../views/Educator/Class';
import AIAssist from '../views/Educator/AIAssist';
import NotFound from '../views/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<DashboardView />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Principal Routes */}
      <Route path="/principal" element={<PrincipalDashboard />} />
      
      {/* Superintendent Routes */}
      <Route path="/superintendent" element={<SuperintendentDashboard />} />
      
      {/* Instructor Routes */}
      <Route path="/instructor" element={<InstructorDashboard />} />
      
      {/* Mentor Routes */}
      <Route path="/mentor" element={<MentorDashboard />} />
      
      {/* Student Routes - Now with CRAFT framework */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/goals" element={<Goals />} />
      <Route path="/student/assistant" element={<Assistant />} />
      <Route path="/student/badges" element={<Badges />} />
      <Route path="/student/projects" element={<Projects />} />
      <Route path="/student/reflections" element={<Reflections />} />
      
      {/* Parent Routes */}
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/parent/insights" element={<Insights />} />
      <Route path="/parent/messages" element={<Messages />} />
      
      {/* Educator Routes */}
      <Route path="/educator" element={<EducatorDashboard />} />
      <Route path="/educator/class" element={<Class />} />
      <Route path="/educator/ai" element={<AIAssist />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
