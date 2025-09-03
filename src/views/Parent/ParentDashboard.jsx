import React from "react";

const ParentDashboard = () => {
  return (
    <div className="p-6 text-purple-900">
      <h1 className="text-3xl font-bold mb-2">👨‍👩‍👧 Parent Hub</h1>
      <p className="mb-6 text-lg">Supporting your child’s success every step of the way.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
          <h2 className="text-xl font-semibold">Progress Overview</h2>
          <p className="text-gray-600 mt-1">This week’s learning summary</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h2 className="text-xl font-semibold">Messages from Educators</h2>
          <p className="text-gray-600 mt-1">1 new message</p>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
