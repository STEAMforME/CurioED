import React from 'react';
import '../../App.css';

const Messages = () => {
  return (
    <div className="page parent-messages">
      <h1>💌 Messages from Educators</h1>
      <ul className="message-list">
        <li>
          <strong>Mr. Rivera:</strong> Jaelon showed great teamwork in today’s challenge!
        </li>
        <li>
          <strong>Ms. Ahmed:</strong> Don’t forget to review the math folder on CurioED before Monday.
        </li>
      </ul>
    </div>
  );
};

export default Messages;
