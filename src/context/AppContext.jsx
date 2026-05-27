/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer } from "react";

// Create a local context pool instance
const AppContext = createContext(null);

// Hook implementation to consume application values safely
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside an AppProvider");
  }
  return context;
}

const initialState = {
  orders: [],
  // EXPANDED INVENTORY: Formatted with Amazon-style pricing structures (No ratings, unique bulletproof images)
  inventory: [
    {
      id: 1,
      name: "Watch Activity Tracker, Heart Rate Monitor, Smart Activity Tracker",
      category: "WEARABLES",
      description: "Smart Activity Tracker, Alert for Android and iPhone (Red). Only 1 left in stock.",
      price: 1282,
      mrp: 4495,
      discount: "71% off",
      stock: 8,
      reorderLevel: 4,
      sku: "WEAR-202",
      image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      name: "Dahua DH-HAC-HFW1000RP 1MP 720P Water-Proof HDCVI IR Night Vision Camera",
      category: "ELECTRONICS",
      description: "Bullet Camera (White). Save 5% with coupon. FREE delivery Sun, 31 May.",
      price: 999,
      mrp: 1599,
      discount: "38% off",
      stock: 12,
      reorderLevel: 5,
      sku: "ELEC-101",
      // ⚡ Swapped to an unblockable, dedicated production mock placeholder image asset
      image: "https://picsum.photos/id/433/500/400" 
    },
    {
      id: 3,
      name: "HTC Android Vive - Virtual Reality System",
      category: "ELECTRONICS",
      description: "Windows 10 compatibility. Flat INR 750 Off on Select Bank Cards. Only 2 left in stock.",
      price: 59990,
      mrp: 127990,
      discount: "53% off",
      stock: 2,
      reorderLevel: 3,
      sku: "ELEC-707",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      name: "Dahua C-Series DH-IPC-C15 1.3MP HD Wi-Fi Camera (White)",
      category: "ELECTRONICS",
      description: "No featured offers available. Secure cloud tracking capabilities included natively.",
      price: 3499,
      mrp: 5999,
      discount: "41% off",
      stock: 20,
      reorderLevel: 6,
      sku: "ACCS-303",
      // ⚡ Swapped to an unblockable, dedicated production mock placeholder image asset
      image: "https://picsum.photos/id/250/500/400" 
    }
  ],
  alerts: [],
  metrics: [
    {
      id: 1,
      service: "Orders API",
      environment: "Production",
      requestsPerMin: 210,
      latency: 184,
      uptime: 99.2,
      errorRate: 1.8,
    },
    {
      id: 2,
      service: "Inventory API",
      environment: "Production",
      requestsPerMin: 148,
      latency: 124,
      uptime: 99.7,
      errorRate: 0.9,
    },
    {
      id: 3,
      service: "Auth API",
      environment: "Production",
      requestsPerMin: 98,
      latency: 88,
      uptime: 99.9,
      errorRate: 0.3,
    },
    {
      id: 4,
      service: "Shipping Service",
      environment: "Staging",
      requestsPerMin: 72,
      latency: 245,
      uptime: 97.8,
      errorRate: 3.9,
    },
  ],
};

function appReducer(state, action) {
  switch (action.type) {
    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };
    case "DELETE_ORDER":
      return { ...state, orders: state.orders.filter((o) => o.id !== action.payload) };
    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) => o.id === action.payload.id ? { ...o, status: action.payload.status } : o),
      };
    case "ADD_INVENTORY_ITEM":
      return { ...state, inventory: [action.payload, ...state.inventory] };
    case "DELETE_INVENTORY_ITEM":
      return { ...state, inventory: state.inventory.filter((i) => i.id !== action.payload) };
    case "ADJUST_INVENTORY_STOCK":
      return {
        ...state,
        inventory: state.inventory.map((i) => i.id === action.payload.id ? { ...i, stock: Math.max(0, i.stock + action.payload.amount) } : i),
      };
    case "ADD_ALERT":
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case "ACKNOWLEDGE_ALERT":
      return { ...state, alerts: state.alerts.map((a) => a.id === action.payload ? { ...a, acknowledged: true } : a) };
    case "RESOLVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((a) => a.id === action.payload ? { ...a, resolved: true, acknowledged: true } : a),
      };
    case "DELETE_ALERT":
      return { ...state, alerts: state.alerts.filter((a) => a.id !== action.payload) };
    case "UPDATE_METRIC":
      return {
        ...state,
        metrics: state.metrics.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                [action.payload.field]:
                  action.payload.field === "uptime"
                    ? Math.min(100, Math.max(90, Number((item[action.payload.field] + action.payload.delta).toFixed(1))))
                    : Math.max(0, Number((item[action.payload.field] + action.payload.delta).toFixed(1))),
              }
            : item
        ),
      };
    case "PLACE_CUSTOMER_ORDER": {
      const { customerName, items } = action.payload;
      let nextAlerts = [...state.alerts];

      const newOrders = items.map((item, index) => ({
        id: Date.now() + index,
        customer: customerName,
        product: item.name,
        quantity: item.quantity,
        status: "PLACED",
        priority: item.quantity >= 2 ? "High" : "Medium",
      }));

      const updatedInventory = state.inventory.map((inventoryItem) => {
        const orderedItem = items.find((cartItem) => cartItem.name === inventoryItem.name);
        if (!orderedItem) return inventoryItem;

        const updatedStock = Math.max(0, inventoryItem.stock - orderedItem.quantity);

        if (updatedStock <= inventoryItem.reorderLevel) {
          const alreadyExists = nextAlerts.some(
            (a) => a.category === "Inventory" && a.title === "Low inventory alert" && a.description.includes(inventoryItem.name) && !a.resolved
          );

          if (!alreadyExists) {
            nextAlerts = [
              {
                id: Date.now() + Math.floor(Math.random() * 1000),
                title: "Low inventory alert",
                description: `${inventoryItem.name} stock dropped below the reorder threshold.`,
                severity: updatedStock === 0 ? "Critical" : "High",
                category: "Inventory",
                source: "Inventory Service",
                acknowledged: false,
                resolved: false,
                time: "Just now",
              },
              ...nextAlerts,
            ];
          }
        }
        return { ...inventoryItem, stock: updatedStock };
      });

      return {
        ...state,
        orders: [...newOrders, ...state.orders],
        inventory: updatedInventory,
        alerts: nextAlerts,
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}