import React, { createContext, useContext, useState, useEffect } from "react";
import { UserResponse } from "../types/api";
import { getProfile } from "../services/api";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserResponse | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        localStorage.setItem("token", token);
        // Fetch user profile if not already loaded
        if (!user) {
          try {
            const response = await getProfile();
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setToken(null);
          }
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, user, setUser, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
