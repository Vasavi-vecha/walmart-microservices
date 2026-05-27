// src/api/catalogApi.js

export const catalogApi = {
  getAllProducts: async () => {
    return [];
  },

  getProductById: async (id) => {
    return { id, name: "Fallback Product", price: 0, stock: 0 };
  },

  addInventoryItem: async (productData) => {
    return productData;
  },

  deleteInventoryItem: async (id) => {
    return { id, success: true };
  }
};