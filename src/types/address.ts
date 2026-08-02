/** Customer address shapes — Nest GET /addresses (orders.listAddresses) */

export type CustomerAddress = {
  id?: string;
  fullName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country?: string | null;
  postalCode: string;
  gstin?: string | null;
};

/** Most recent unique shipping address from order history (no isDefault flag in Nest). */
export function pickDefaultAddress(
  addresses: CustomerAddress[] | undefined | null,
): CustomerAddress | undefined {
  return addresses?.[0];
}

export function findAddressById(
  addresses: CustomerAddress[] | undefined | null,
  id: string | undefined | null,
): CustomerAddress | undefined {
  if (!id || !addresses?.length) return undefined;
  return addresses.find((a) => a.id === id);
}
