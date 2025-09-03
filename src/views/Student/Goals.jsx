import React from 'react';
import '../../App.css';

const Goals = () => {
  return (
    <div className="page student-goals">
      <h1>🎯 My Learning Goals</h1>
      <p>Set and track the goals that matter most to you.</p>
      <ul className="goal-list">
        <li>📚 Finish my reading log by Friday</li>
        <li>🧪 Complete the volcano science project</li>
        <li>🎨 Submit a drawing to the CurioED showcase</li>
      </ul>
    </div>
  );
};

export default Goals;
