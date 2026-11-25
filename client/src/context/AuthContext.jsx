import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  updateUserProfile, 
  logoutUser 
} from "../services/auth.api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("healu_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("healu_token") || null);
  const [loading, setLoading] = useState(true);

  // Modal control state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'signup'

  // Load user on mount if token is saved in localStorage
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const savedToken = localStorage.getItem("healu_token");
      if (!savedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("healu_user");
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
            setToken(savedToken);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem("healu_token");
            localStorage.removeItem("healu_user");
          }
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("healu_token");
          localStorage.removeItem("healu_user");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();

    const handleSessionExpired = () => {
      if (isMounted) {
        setUser(null);
        setToken(null);
        setAuthModalTab("login");
        setAuthModalOpen(true);
      }
    };
    window.addEventListener("healu:session-expired", handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener("healu:session-expired", handleSessionExpired);
    };
  }, []);

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    setToken(data.token);
    closeAuthModal();
    return data.user;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setUser(data.user);
    setToken(data.token);
    closeAuthModal();
    return data.user;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const updated = await updateUserProfile(profileData);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
