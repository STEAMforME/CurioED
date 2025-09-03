// src/layout/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, School, Person, Menu } from "lucide-react";

const Sidebar = ({ role }) => {
  const location = useLocation();
  const routes = {
    student: [
      { path: "/student", label: "Dashboard", icon: <Home /> },
      { path: "/student/goals", label: "My Goals", icon: <School /> },
      { path: "/student/assistant", label: "Nova Byte", icon: <Person /> },
    ],
    parent: [
      { path: "/parent", label: "Dashboard", icon: <Home /> },
      { path: "/parent/insights", label: "Progress", icon: <School /> },
      { path: "/parent/messages", label: "Messages", icon: <Person /> },
    ],
    educator: [
      { path: "/educator", label: "Dashboard", icon: <Home /> },
      { path: "/educator/class", label: "My Class", icon: <School /> },
      { path: "/educator/ai", label: "AI Assist", icon: <Person /> },
    ],
  };

  return (
    <div className="bg-gradient-to-b from-purple-700 to-purple-900 text-white h-screen w-64 p-4 space-y-4 shadow-xl">
      <div className="text-2xl font-bold mb-8">CurioED</div>
      <nav className="space-y-2">
        {routes[role].map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              location.pathname.startsWith(path)
                ? "bg-white text-purple-800 font-semibold"
                : "hover:bg-purple-800"
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
