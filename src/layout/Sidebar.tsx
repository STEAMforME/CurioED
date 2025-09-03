// src/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  role: 'student' | 'parent' | 'educator';
}

interface RouteItem {
  path: string;
  label: string;
  icon: string;
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();

  const routes: Record<SidebarProps['role'], RouteItem[]> = {
    student: [
      { path: '/student', label: 'Dashboard', icon: '🏠' },
      { path: '/student/goals', label: 'My Goals', icon: '🎯' },
      { path: '/student/assistant', label: 'Nova Byte', icon: '🤖' },
    ],
    parent: [
      { path: '/parent', label: 'Dashboard', icon: '🏠' },
      { path: '/parent/insights', label: 'Progress', icon: '📈' },
      { path: '/parent/messages', label: 'Messages', icon: '💬' },
    ],
    educator: [
      { path: '/educator', label: 'Dashboard', icon: '🏠' },
      { path: '/educator/class', label: 'My Class', icon: '📚' },
      { path: '/educator/ai', label: 'AI Assist', icon: '🤖' },
    ],
  };

  const items = routes[role] ?? [];

  return (
    <aside className="bg-gradient-to-b from-primary-light to-primary-dark text-white h-screen w-64 p-6 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="text-3xl font-extrabold mb-10 tracking-tight">🎓 CurioED</div>
        <nav className="space-y-4">
          {items.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-lg ${
                location.pathname.startsWith(path)
                  ? 'bg-white text-primary-dark font-semibold'
                  : 'hover:bg-primary-dark hover:text-white'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <footer className="text-sm text-primary-light">
        <p className="opacity-80">© 2025 CurioED</p>
        <p className="opacity-60">Empowering Every Learner</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
