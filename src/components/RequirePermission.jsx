import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const RequirePermission = ({ permission, children }) => {
  const { hasPermission } = useAppContext();

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequirePermission;