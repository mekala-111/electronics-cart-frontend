"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { cartService } from "@/services/commerce.service";
import { catalogService } from "@/services/catalog.service";
import { queryKeys } from "@/hooks/query-keys";
import type {
  CartDto,
  CartLineDisplay,
  CartLineView,
  CartProductMetaMap,
} from "@/types/cart";
import type { Product } from "@/types";
import { ApiError } from "@/types/api";
import { toUiProduct } from "@/models/product";
import { allowApiFallbacks } from "@/lib/env";

const emptyCart = (): CartDto => ({
  id: "pending",
  currency: "INR",
  status: "active",
  subtotal: 0,
  items: [],
});

function readMeta(qc: QueryClient): CartProductMetaMap {
  return qc.getQueryData<CartProductMetaMap>(queryKeys.cartProductMeta) ?? {};
}

function writeMeta(qc: QueryClient, next: CartProductMetaMap) {
  qc.setQueryData(queryKeys.cartProductMeta, next);
}

export function productToCartDisplay(product: Product): CartLineDisplay {
  return {
    productId: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    specs: product.specs,
  };
}

export function mergeCartLines(
  cart: CartDto | undefined,
  meta: CartProductMetaMap,
): CartLineView[] {
  return (cart?.items ?? []).map((line) => {
    const display = meta[line.variantId];
    return {
      ...line,
      productId: display?.productId ?? line.variantId,
      name: display?.name ?? line.sku,
      brand: display?.brand ?? "",
      image: display?.image ?? "/images/laptop.png",
      specs: display?.specs ?? line.sku,
    };
  });
}

export function useCartQuery() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      try {
        return await cartService.get();
      } catch (err) {
        if (
          allowApiFallbacks &&
          err instanceof ApiError &&
          (err.isServerError || err.status === 500 || err.offline)
        ) {
          return emptyCart();
        }
        throw err;
      }
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: (count, error) => {
      if (error instanceof ApiError && (error.offline || error.isUnauthorized)) return false;
      if (allowApiFallbacks && error instanceof ApiError && error.isServerError) return false;
      return count < 1;
    },
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}

export function useCartProductMeta() {
  return useQuery({
    queryKey: queryKeys.cartProductMeta,
    queryFn: () => ({} as CartProductMetaMap),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: {},
  });
}

export function useCartLines() {
  const cart = useCartQuery();
  const meta = useCartProductMeta();
  const lines = mergeCartLines(cart.data, meta.data ?? {});
  const subtotal =
    cart.data?.subtotal ?? lines.reduce((n, l) => n + l.lineTotal, 0);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return {
    ...cart,
    lines,
    subtotal,
    count,
    cartId: cart.data?.id,
  };
}

export function useCartItemCount() {
  const { count, isLoading } = useCartLines();
  return { count, isLoading };
}

type AddVars = {
  variantId?: string;
  quantity?: number;
  product?: Product;
  productId?: string;
  display?: CartLineDisplay;
};

async function resolveVariantId(vars: AddVars): Promise<{ variantId: string; product?: Product }> {
  if (vars.variantId) return { variantId: vars.variantId, product: vars.product };
  if (vars.product?.variantId) {
    return { variantId: vars.product.variantId, product: vars.product };
  }
  const productId = vars.productId ?? vars.product?.id;
  if (!productId) {
    throw new ApiError({
      message: "This product cannot be added — missing variant id",
      code: "MISSING_VARIANT",
      status: 400,
    });
  }
  const detail = await catalogService.product(productId);
  const ui = toUiProduct(detail);
  if (!ui.variantId) {
    throw new ApiError({
      message: "No active variant available for this product",
      code: "MISSING_VARIANT",
      status: 404,
    });
  }
  return { variantId: ui.variantId, product: vars.product ?? ui };
}

export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AddVars) => {
      const resolved = await resolveVariantId(vars);
      const quantity = vars.quantity ?? 1;
      const cart = await cartService.addItem(resolved.variantId, quantity);
      return { cart, resolved };
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const prev = qc.getQueryData<CartDto>(queryKeys.cart);
      const optimisticVariantId =
        vars.variantId ?? vars.product?.variantId ?? `pending-${vars.product?.id ?? "x"}`;
      const display =
        vars.display ?? (vars.product ? productToCartDisplay(vars.product) : undefined);
      if (display && !optimisticVariantId.startsWith("pending-")) {
        writeMeta(qc, { ...readMeta(qc), [optimisticVariantId]: display });
      }

      const qty = vars.quantity ?? 1;
      const unitPrice = vars.product?.price ?? 0;
      if (!optimisticVariantId.startsWith("pending-")) {
        qc.setQueryData<CartDto>(queryKeys.cart, (old) => {
          const base = old ?? emptyCart();
          const existing = base.items.find((i) => i.variantId === optimisticVariantId);
          const items = existing
            ? base.items.map((i) =>
                i.variantId === optimisticVariantId
                  ? {
                      ...i,
                      quantity: i.quantity + qty,
                      lineTotal: (i.quantity + qty) * i.unitPrice,
                    }
                  : i,
              )
            : [
                ...base.items,
                {
                  id: `optimistic-${optimisticVariantId}`,
                  variantId: optimisticVariantId,
                  sku: vars.product?.specs ?? optimisticVariantId,
                  quantity: qty,
                  unitPrice,
                  lineTotal: unitPrice * qty,
                },
              ];
          const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
          return { ...base, items, subtotal };
        });
      }

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart, ctx.prev);
    },
    onSuccess: ({ cart, resolved }, vars) => {
      const display =
        vars.display ??
        (resolved.product
          ? productToCartDisplay(resolved.product)
          : vars.product
            ? productToCartDisplay(vars.product)
            : undefined);
      if (display) {
        writeMeta(qc, { ...readMeta(qc), [resolved.variantId]: display });
      }
      qc.setQueryData(queryKeys.cart, cart);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) return cartService.removeItem(itemId);
      return cartService.updateItem(itemId, quantity);
    },
    onMutate: async ({ itemId, quantity }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const prev = qc.getQueryData<CartDto>(queryKeys.cart);
      qc.setQueryData<CartDto>(queryKeys.cart, (old) => {
        if (!old) return old;
        const items =
          quantity < 1
            ? old.items.filter((i) => i.id !== itemId)
            : old.items.map((i) =>
                i.id === itemId
                  ? { ...i, quantity, lineTotal: quantity * i.unitPrice }
                  : i,
              );
        return {
          ...old,
          items,
          subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.cart, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const prev = qc.getQueryData<CartDto>(queryKeys.cart);
      qc.setQueryData<CartDto>(queryKeys.cart, (old) => {
        if (!old) return old;
        const items = old.items.filter((i) => i.id !== itemId);
        return {
          ...old,
          items,
          subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.cart, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clear(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.cart });
      const prev = qc.getQueryData<CartDto>(queryKeys.cart);
      qc.setQueryData(queryKeys.cart, emptyCart());
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.cart, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
