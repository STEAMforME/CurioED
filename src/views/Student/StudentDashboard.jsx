import React from "react";

const StudentDashboard = () => {
  return (
    <div className="p-6 text-purple-900">
      <h1 className="text-3xl font-bold mb-2">🎒 Welcome back, Scholar!</h1>
      <p className="mb-6 text-lg">Let’s power up your learning journey today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold">Today’s Mission</h2>
          <p className="text-gray-600 mt-1">Complete your reading and math goals</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold">Nova Byte Tip</h2>
          <p className="text-gray-600 mt-1">“Stay curious! Ask why, not just how.”</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
          <h2 className="text-xl font-semibold">Stars Earned</h2>
          <p className="text-gray-600 mt-1">⭐️⭐️⭐️ 3 badges this week!</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
