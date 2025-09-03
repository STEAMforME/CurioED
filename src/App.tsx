// src/App.tsx
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';
import './App.css';

const roleFromPath = (path: string) => {
  if (path.startsWith('/student')) return 'student';
  if (path.startsWith('/parent')) return 'parent';
  if (path.startsWith('/educator')) return 'educator';
  return null;
};

const LayoutWrapper = () => {
  const location = useLocation();
  const role = roleFromPath(location.pathname);

  return role ? (
    <div className="flex">
      <Sidebar role={role} />
      <MainContent>
        <AppRoutes />
      </MainContent>
    </div>
  ) : (
    <AppRoutes />
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;
