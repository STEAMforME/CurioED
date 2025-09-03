import React from 'react';
import '../../App.css';

const Class = () => {
  return (
    <div className="page educator-class">
      <h1>📋 My Classroom</h1>
      <p>Monitor engagement, assign activities, and celebrate wins.</p>
      <table className="class-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Last Login</th>
            <th>Current Module</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Azah Brown</td>
            <td>Today</td>
            <td>STEAM Science Challenge</td>
            <td>75%</td>
          </tr>
          <tr>
            <td>Terrell Barnette</td>
            <td>Yesterday</td>
            <td>Interactive Coding Lab</td>
            <td>92%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Class;
