import React from "react";
import { AiFillHome } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow">
      {/* Logo */}
      <img
        src="/FormBuilder.png"
        alt="Form Builder Logo"
        className="h-10 w-auto cursor-pointer"
        onClick={() => navigate("/")} // makes logo smaller
      />

      {/* Home Icon */}
      <button
        onClick={() => navigate("/")}
        className={`p-2 rounded-full mx-auto cursor-pointer ${
          location.pathname === "/" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <AiFillHome size={24} />
      </button>
    </div>
  );
}

export default Header;
