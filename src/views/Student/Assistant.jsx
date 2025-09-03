import React from 'react';
import '../../App.css';

const Assistant = () => {
  return (
    <div className="page student-assistant">
      <h1>🤖 Nova Byte – Your Smart Assistant</h1>
      <p>Ask me anything! I'm here to help you learn, create, and explore.</p>
      <div className="assistant-box">
        <p><strong>Nova:</strong> What topic are you curious about today?</p>
        <input placeholder="Type a question..." className="assistant-input" />
        <button className="primary-button">Ask Nova</button>
      </div>
    </div>
  );
};

export default Assistant;
