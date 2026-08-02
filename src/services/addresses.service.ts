import { apiGet } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { CustomerAddress } from "@/types/address";

/**
 * Address book API surface.
 * Nest v1.0 exposes list only — create/update/delete/setDefault are intentionally absent.
 */
export const addressesService = {
  list: () => apiGet<CustomerAddress[]>(endpoints.orders.addresses),
};
