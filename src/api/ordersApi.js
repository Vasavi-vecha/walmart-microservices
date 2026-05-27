// src/api/ordersApi.js

export const ordersApi = {
  placeOrder: async (customerName, items) => {
    return { customerName, items, status: "PLACED", timestamp: "Just now" };
  },

  getOrderHistory: async () => {
    return [];
  },

  updateOrderStatus: async (orderId, status) => {
    return { orderId, status };
  }
};