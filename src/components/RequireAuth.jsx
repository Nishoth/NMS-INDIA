import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const RequireAuth = ({ children }) => {
  const { userData } = useAppContext();
  const location = useLocation();

  if (!userData) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;