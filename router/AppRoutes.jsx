import Home from '../views/Home/Home'; // Add this import

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/educator" element={<EducatorDashboard />} />
      <Route path="/parent" element={<ParentDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};
