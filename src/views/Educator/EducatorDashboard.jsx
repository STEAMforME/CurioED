import React from "react";

const EducatorDashboard = () => {
  return (
    <div className="p-6 text-purple-900">
      <h1 className="text-3xl font-bold mb-2">📘 Educator Dashboard</h1>
      <p className="mb-6 text-lg">Empower your class with data, insights, and AI.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold">Class Snapshot</h2>
          <p className="text-gray-600 mt-1">22 active students</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-pink-500">
          <h2 className="text-xl font-semibold">Goals Met</h2>
          <p className="text-gray-600 mt-1">71% of students met this week’s goals</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-600">
          <h2 className="text-xl font-semibold">AI Suggestions</h2>
          <p className="text-gray-600 mt-1">“Consider a new project-based lesson on ecosystems.”</p>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
