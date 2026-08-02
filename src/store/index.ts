import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStorage } from "@/api/token-storage";

type AuthUser = {
  id?: string;
  name: string;
  email: string;
  roles?: string[];
};

type AuthState = {
  user: AuthUser | null;
  setSession: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setSession: (user) => set({ user }),
      logout: () => {
        tokenStorage.clear();
        set({ user: null });
      },
      isAdmin: () => {
        const roles = get().user?.roles ?? [];
        return roles.some((r) => r === "admin" || r === "super_admin");
      },
    }),
    { name: "ec-auth" },
  ),
);

type RecentState = {
  ids: string[];
  push: (id: string) => void;
};

export const useRecentlyViewedStore = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => {
        const next = [id, ...get().ids.filter((x) => x !== id)].slice(0, 12);
        set({ ids: next });
      },
    }),
    { name: "ec-recent" },
  ),
);

/** UI-only cart chrome — commerce data lives in React Query */
type CartUiState = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

export const useCartUiStore = create<CartUiState>()((set) => ({
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));

/** UI-only wishlist chrome — items live in React Query */
type WishlistUiState = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

export const useWishlistUiStore = create<WishlistUiState>()((set) => ({
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));

/** UI-only checkout chrome — totals/addresses live in React Query */
type CheckoutUiState = {
  step: number;
  setStep: (step: number) => void;
};

export const useCheckoutUiStore = create<CheckoutUiState>()((set) => ({
  step: 0,
  setStep: (step) => set({ step }),
}));

/** UI-only orders chrome — order data lives in React Query */
type OrdersUiState = {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setDateFrom: (dateFrom: string) => void;
  setDateTo: (dateTo: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
};

const ordersUiDefaults = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  page: 1,
};

export const useOrdersUiStore = create<OrdersUiState>()((set) => ({
  ...ordersUiDefaults,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
  setDateTo: (dateTo) => set({ dateTo, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ ...ordersUiDefaults }),
}));

/** UI-only address chrome — address rows live in React Query */
type AddressUiState = {
  selectedId: string | null;
  dialogOpen: boolean;
  setSelectedId: (id: string | null) => void;
  setDialogOpen: (open: boolean) => void;
};

export const useAddressUiStore = create<AddressUiState>()((set) => ({
  selectedId: null,
  dialogOpen: false,
  setSelectedId: (selectedId) => set({ selectedId }),
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
}));

/** UI-only coupon chrome — discount / applied coupon live in React Query */
type CouponUiState = {
  inputVisible: boolean;
  setInputVisible: (visible: boolean) => void;
};

export const useCouponUiStore = create<CouponUiState>()((set) => ({
  inputVisible: true,
  setInputVisible: (inputVisible) => set({ inputVisible }),
}));

/** UI-only shipping chrome — rates/methods live in React Query */
type ShippingUiState = {
  selectedMethodId: string | null;
  selectedQuoteId: string | null;
  sectionExpanded: boolean;
  setSelectedMethodId: (id: string | null) => void;
  setSelectedQuoteId: (id: string | null) => void;
  setSectionExpanded: (open: boolean) => void;
};

export const useShippingUiStore = create<ShippingUiState>()((set) => ({
  selectedMethodId: null,
  selectedQuoteId: null,
  sectionExpanded: true,
  setSelectedMethodId: (selectedMethodId) => set({ selectedMethodId }),
  setSelectedQuoteId: (selectedQuoteId) => set({ selectedQuoteId }),
  setSectionExpanded: (sectionExpanded) => set({ sectionExpanded }),
}));

/** UI-only payment chrome — payment records live in React Query */
type PaymentUiState = {
  selectedMethodId: string | null;
  dialogOpen: boolean;
  submitting: boolean;
  setSelectedMethodId: (id: string | null) => void;
  setDialogOpen: (open: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
};

export const usePaymentUiStore = create<PaymentUiState>()((set) => ({
  selectedMethodId: null,
  dialogOpen: false,
  submitting: false,
  setSelectedMethodId: (selectedMethodId) => set({ selectedMethodId }),
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
  setSubmitting: (submitting) => set({ submitting }),
}));
