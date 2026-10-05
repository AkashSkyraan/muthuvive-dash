import React, { createContext, useContext, useEffect, useState } from "react";
// import { getUser } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      //   const response = await getUser();

      if (response?.success === true || response?.success === 1) {
        // setUser(response?.data?.[0] || null);
        setUser(response?.data?.[0] || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Get User Error:", error);
      setUser(null);
    } finally {
      // setUser({
      //   id: 1,
      //   user_name: "AKASH",
      //   email: "abcdef@gmail.com",
      //   mobile: "9876543210",
      // });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
