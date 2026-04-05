import React from "react";
import { useAuth } from "../context/AuthContext";

const AuthButton: React.FC = () => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Logout
    </button>
  );
};

export default AuthButton;
