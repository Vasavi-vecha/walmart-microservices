/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useEffect } from "react";

// Create a local context pool instance
const AuthContext = createContext(null);

// Hook implementation to consume context parameters safely
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

// Main Component Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const savedUsers = localStorage.getItem("retailflow_users");
    return savedUsers ? JSON.parse(savedUsers) : [
      {
        id: 1,
        name: "Admin User",
        email: "admin@retailflow.com",
        password: "adminpassword123",
        role: "ADMIN",
      }
    ];
  });

  const [alerts, setAlerts] = useState(() => {
    const savedAlerts = localStorage.getItem("retailflow_alerts");
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  });

  useEffect(() => {
    localStorage.setItem("retailflow_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem("retailflow_alerts", JSON.stringify(alerts));
  }, [alerts]);

  function addAlert(type, service, message) {
    const newAlert = {
      id: Date.now(),
      type,
      service,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }

  function resolveAlert(id) {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
  }

  async function login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const searchEmail = email.toLowerCase().trim();
    const matchingUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === searchEmail && u.password === password
    );

    if (!matchingUser) {
      addAlert(
        "INCIDENT",
        "Authentication Router",
        `Failed login attempt on email entry channel: ${email}`
      );
      throw new Error("Access Denied: Account not found or password incorrect. Please signup first!");
    }

    setUser(matchingUser);
    return matchingUser;
  }

  async function signup(name, email, password) {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const newEmail = email.toLowerCase().trim();
    const emailExists = registeredUsers.some((u) => u.email === newEmail);
    if (emailExists) {
      throw new Error("This email is already registered. Please proceed to login.");
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: newEmail,
      password: password,
      role: "CUSTOMER",
    };

    setRegisteredUsers((prevUsers) => [...prevUsers, newUser]);
    return newUser;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      alerts,        
      addAlert,      
      resolveAlert   
    }),
    // Kept clean dependencies to make ESLint perfectly satisfied
    [user, alerts, login, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}