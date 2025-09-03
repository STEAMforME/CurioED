import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';
import AppRoutes from './router/AppRoutes';

const App = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <MainContent>
          <AppRoutes />
        </MainContent>
      </div>
    </div>
  );
};

export default App;
