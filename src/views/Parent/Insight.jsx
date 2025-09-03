import React from 'react';
import '../../App.css';

const Insight = () => {
  return (
    <div className="page parent-insight">
      <h1>📊 Student Insights</h1>
      <p>Track progress, engagement, and growth over time.</p>
      <div className="insight-cards">
        <div className="insight-card">
          <h3>Reading Level</h3>
          <p>Above Grade Level</p>
        </div>
        <div className="insight-card">
          <h3>Math Confidence</h3>
          <p>Improving steadily</p>
        </div>
        <div className="insight-card">
          <h3>Project Completion</h3>
          <p>92% this month</p>
        </div>
      </div>
    </div>
  );
};

export default Insight;
