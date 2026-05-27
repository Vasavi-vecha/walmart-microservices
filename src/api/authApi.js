// src/api/authApi.js

export const authApi = {
  // Completely removed the password parameters since the local system skips them
  login: async (email) => {
    console.log("[Local Auth System] Processing login simulation...");
    return { 
      email: email.toLowerCase().trim(), 
      role: email.toLowerCase().includes("admin") ? "ADMIN" : "CUSTOMER" 
    };
  },

  signup: async (name, email) => {
    console.log("[Local Auth System] Processing signup simulation...");
    return { name, email, role: "CUSTOMER" };
  },
  
  getProfile: async () => {
    return { name: "Active Operator", role: "ADMIN" };
  }
};