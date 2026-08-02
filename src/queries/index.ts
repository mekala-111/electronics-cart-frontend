/** Query-option factories — re-export hooks for architecture parity */
export {
  useBrands,
  useCategories,
  useFeaturedProducts,
  useFlashDeals,
  useNewestProducts,
  useProduct,
  useProducts,
  useRecommendations,
  useRefurbishedProducts,
} from "@/hooks/use-catalog";

export {
  useAdminDashboard,
  useAdminInventory,
  useAdminOrders,
  useAdminProducts,
} from "@/hooks/use-commerce";

export {
  useCheckout,
  usePlaceOrder,
  useWarehouses,
} from "@/hooks/use-checkout";

export {
  prefetchShippingMethods,
  useDeliverySlots,
  usePickupPoints,
  useShippingEstimate,
  useShippingMethods,
} from "@/hooks/use-shipping";

export {
  prefetchAddresses,
  useAddress,
  useAddresses,
  useDefaultAddress,
} from "@/hooks/use-addresses";

/** Alias — same shared address query as profile/checkout */
export { useAddresses as useCheckoutAddresses } from "@/hooks/use-addresses";

export {
  formatCouponFailure,
  useAppliedCoupon,
  useApplyCoupon,
  useCouponValidation,
  useCoupons,
  useRemoveCoupon,
  useValidateCoupon,
} from "@/hooks/use-coupons";

/** Checkout aliases — same shared coupon mutations */
export {
  useApplyCoupon as useApplyCheckoutCoupon,
  useCouponValidation as useValidateCheckoutCoupon,
} from "@/hooks/use-coupons";

export {
  formatOrderDate,
  formatOrderDateTime,
  prefetchOrder,
  useCancelOrder,
  useCancellationReasons,
  useOrder,
  useOrders,
  useRequestReturn,
} from "@/hooks/use-orders";

export {
  isPaymentRetryable,
  isPaymentSuccessful,
  useCancelPayment,
  useCreatePayment,
  useOrderPayments,
  usePayment,
  usePaymentMethods,
  usePaymentRefunds,
  usePaymentVerification,
  usePayments,
  useRetryPayment,
} from "@/hooks/use-payments";

export {
  useAddToCart,
  useCartItemCount,
  useCartLines,
  useCartQuery,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/use-cart";

export {
  useIsInWishlist,
  useToggleWishlist,
  useWishlist,
  useWishlistItemCount,
  useWishlistProducts,
} from "@/hooks/use-wishlist";

export {
  useForgotPassword,
  useGoogleSignIn,
  useLogin,
  useLogout,
  useMe,
  useRegister,
  useSendOtp,
  useVerifyOtp,
} from "@/hooks/use-auth";
