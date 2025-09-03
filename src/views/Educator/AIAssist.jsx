import React from 'react';
import '../../App.css';

const AIAssist = () => {
  return (
    <div className="page educator-ai">
      <h1>🤖 CurioED AI Assistant</h1>
      <p>Generate lesson ideas, draft messages, or summarize student progress instantly.</p>
      <div className="ai-box">
        <textarea
          className="ai-input"
          placeholder="e.g., Generate a STEAM lesson for 5th grade on weather patterns"
        />
        <button className="primary-button">Generate</button>
      </div>
    </div>
  );
};

export default AIAssist;
