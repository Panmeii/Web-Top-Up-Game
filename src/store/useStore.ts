import { create } from "zustand";
import { Game, Product, Voucher, Order, OrderStatus } from "../types";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "MEMBER" | "ADMIN";
  walletBalance: number;
}

interface AppStore {
  // Authentication State
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  updateWalletBalance: (amount: number) => void;

  // Active Catalog State
  gamesList: Game[];
  productsList: Product[];
  vouchersList: Voucher[];
  activeOrders: Order[];
  setGamesList: (games: Game[]) => void;
  setProductsList: (products: Product[]) => void;
  setVouchersList: (vouchers: Voucher[]) => void;
  setActiveOrders: (orders: Order[]) => void;

  // Search & Filter state
  gamesQuery: string;
  setGamesQuery: (query: string) => void;

  // Ordering Modal state
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
  preSelectedProductId: string | undefined;
  setPreSelectedProductId: (id: string | undefined) => void;

  // Active tracked transaction identifier
  activeTrackerInvoice: string | undefined;
  setActiveTrackerInvoice: (invoiceId: string | undefined) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Authentication Initial State
  currentUser: {
    id: "user-001",
    email: "riankampank@gmail.com",
    name: "Rian Kampank",
    role: "ADMIN", // Default admin for bootstrap admin panel testing
    walletBalance: 150000.0 // Loaded with Rp 150.000 simulation credit
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  updateWalletBalance: (amount) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, walletBalance: amount } : null
  })),

  // Catalog State
  gamesList: [],
  productsList: [],
  vouchersList: [],
  activeOrders: [],
  
  setGamesList: (games) => set({ gamesList: games }),
  setProductsList: (products) => set({ productsList: products }),
  setVouchersList: (vouchers) => set({ vouchersList: vouchers }),
  setActiveOrders: (orders) => set({ activeOrders: orders }),

  // Search filter State
  gamesQuery: "",
  setGamesQuery: (query) => set({ gamesQuery: query }),

  // Modal State
  selectedGame: null,
  setSelectedGame: (game) => set({ selectedGame: game }),
  preSelectedProductId: undefined,
  setPreSelectedProductId: (id) => set({ preSelectedProductId: id }),

  // Invoice Tracking Tracker Tab target
  activeTrackerInvoice: undefined,
  setActiveTrackerInvoice: (invoiceId) => set({ activeTrackerInvoice: invoiceId })
}));
