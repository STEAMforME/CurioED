import { Routes, Route } from 'react-router-dom';
import Home from '../views/Home/Home';
import EducatorDashboard from '../views/Educator/EducatorDashboard';
import ParentDashboard from '../views/Parent/ParentDashboard';
import StudentDashboard from '../views/Student/StudentDashboard';npm run dev
import NotFound from '../views/NotFound';

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
