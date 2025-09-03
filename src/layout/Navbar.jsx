// src/layout/Navbar.jsx
import React from 'react';

const Navbar = ({ title }) => {
  return (
    <div className="bg-white shadow-md py-4 px-6 text-xl font-semibold text-purple-800 sticky top-0 z-10">
      {title}
    </div>
  );
};

export default Navbar;
