import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get logged-in admin from backend
  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/admin/auth/me");

      if (
        response?.status === 200 &&
        response?.data?.success === 1 &&
        response?.data?.data?.length > 0
      ) {
        setUser(response.data.data[0]);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        "Auth Me Error:",
        error?.response?.data || error.message
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  // Login success
  const login = (userData) => {
    setUser(userData);
  };

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.post("/admin/logout");
    } catch (error) {
      console.error(
        "Logout Error:",
        error?.response?.data || error.message
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};