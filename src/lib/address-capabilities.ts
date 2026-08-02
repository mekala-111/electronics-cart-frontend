/**
 * Customer address book capabilities for Nest v1.0.
 * Only GET /addresses exists (recent order shipping addresses).
 * Do not invent CRUD — keep this matrix in sync with the backend.
 */
export const ADDRESS_CAPABILITIES = {
  list: true,
  detail: false,
  create: false,
  update: false,
  delete: false,
  setDefault: false,
  /** Backend validates AddressDto only inside POST /checkout, not a standalone address API */
  standaloneValidation: false,
} as const;

export type AddressCapability = keyof typeof ADDRESS_CAPABILITIES;

export function addressCapabilityEnabled(key: AddressCapability): boolean {
  return ADDRESS_CAPABILITIES[key];
}

export const ADDRESS_CAPABILITY_MESSAGE =
  "Address create, edit, delete, and set-default are not available yet. Addresses come from past orders and can be reused at checkout.";
