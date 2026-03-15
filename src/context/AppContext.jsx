import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { internalUsers, ROLES, ROLE_PERMISSIONS } from "../assets/assets";
import { useApi } from "../hooks/useApi";

export const AppContext = createContext();
const LS_USER = "userData";

// Role → default route
const roleLandingRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/dashboard";
    case ROLES.CASE_MANAGER:
      return "/dashboard";
    case ROLES.ADVOCATE:
      return "/dashboard";
    case ROLES.STAFF:
      return "/dashboard";
    default:
      return "/dashboard";
  }
};

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(false);
  const { login: apiLogin, getMe, handleRequest } = useApi();

  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (userData) localStorage.setItem(LS_USER, JSON.stringify(userData));
    else localStorage.removeItem(LS_USER);
  }, [userData]);

  const toSafeUser = (u) => {
    if (!u) return null;
    // remove password if exists
    // eslint-disable-next-line no-unused-vars
    const { password, ...safe } = u;
    return safe;
  };

  // ✅ permissions helper
  const hasPermission = (perm) => {
    if (!userData) return false;
    if (userData.permissions?.includes("ALL")) return true;
    return userData.permissions?.includes(perm);
  };

  // ✅ role helper
  const hasRole = (...roles) => {
    if (!userData) return false;
    return roles.includes(userData.role);
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPassword = (password || "").toString();

      // 1. Attempt API login
      const { data: tokenData, error: loginError } = await handleRequest(() => apiLogin(cleanEmail, cleanPassword));

      if (loginError) {
        return { success: false, message: loginError };
      }

      if (tokenData?.access_token) {
        // Save token to localStorage
        localStorage.setItem("token", tokenData.access_token);

        // Fetch user profile
        const { data: userProfile, error: profileError } = await handleRequest(() => getMe());

        if (profileError) {
          localStorage.removeItem("token");
          return { success: false, message: "Failed to fetch user profile" };
        }

        if (userProfile) {
          const extendedUser = {
            ...userProfile,
            permissions: userProfile.permissions || ROLE_PERMISSIONS[userProfile.role] || [],
          };
          setUserData(extendedUser);
          navigate(roleLandingRoute(extendedUser.role));
          return { success: true, data: extendedUser };
        }
      }

      return { success: false, message: "Invalid email or password" };
    } catch (e) {
      return { success: false, message: "An unexpected error occurred during login." };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/admin/login");
  };

  const value = useMemo(
    () => ({
      userData,
      authLoading,
      login,
      logout,
      hasPermission,
      hasRole,
      isLoggedIn: !!userData,
    }),
    [userData, authLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);