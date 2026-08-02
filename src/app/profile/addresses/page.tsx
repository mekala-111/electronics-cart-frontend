"use client";

import { ProfileShell } from "@/features/profile/profile-shell";
import { RequireAuth } from "@/components/shared/require-auth";
import { QueryState } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { useAddresses, useDefaultAddress } from "@/hooks/use-addresses";
import {
  ADDRESS_CAPABILITIES,
  ADDRESS_CAPABILITY_MESSAGE,
} from "@/lib/address-capabilities";
import { useAddressUiStore } from "@/store";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const addressesQuery = useAddresses();
  const { data: defaultAddress } = useDefaultAddress();
  const selectedId = useAddressUiStore((s) => s.selectedId);
  const setSelectedId = useAddressUiStore((s) => s.setSelectedId);
  const addresses = addressesQuery.data ?? [];

  return (
    <RequireAuth>
      <ProfileShell title="Saved Addresses">
        <p className="mb-4 text-sm text-muted" role="note">
          {ADDRESS_CAPABILITY_MESSAGE}
        </p>

        <QueryState
          isLoading={addressesQuery.isLoading && !addressesQuery.data}
          isFetching={addressesQuery.isFetching}
          isError={addressesQuery.isError}
          error={addressesQuery.error}
          onRetry={() => void addressesQuery.refetch()}
          isEmpty={!addressesQuery.isLoading && addresses.length === 0}
          emptyTitle="No addresses yet"
          emptyDescription="Addresses appear here after you place an order."
          skeleton={
            <div className="h-28 animate-pulse rounded-[18px] border border-border bg-section" />
          }
        >
          <div className="space-y-3">
            {addresses.map((addr) => {
              const key = addr.id ?? `${addr.line1}-${addr.postalCode}`;
              const isDefault = defaultAddress
                ? (defaultAddress.id && addr.id
                    ? defaultAddress.id === addr.id
                    : defaultAddress.line1 === addr.line1 &&
                      defaultAddress.postalCode === addr.postalCode)
                : false;
              const isSelected =
                selectedId != null
                  ? selectedId === key
                  : isDefault;

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-[18px] border border-border p-5",
                    isSelected && "border-primary/50",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-navy">{addr.fullName}</p>
                      {isDefault ? (
                        <p className="mt-1 text-xs font-semibold text-primary">
                          Most recent
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setSelectedId(key)}
                    >
                      View
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {addr.line1}
                    {addr.line2 ? (
                      <>
                        <br />
                        {addr.line2}
                      </>
                    ) : null}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.phone}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!ADDRESS_CAPABILITIES.update}
                      title={
                        ADDRESS_CAPABILITIES.update
                          ? "Edit address"
                          : "Edit is not supported by the server yet"
                      }
                      aria-disabled={!ADDRESS_CAPABILITIES.update}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!ADDRESS_CAPABILITIES.setDefault || isDefault}
                      title={
                        ADDRESS_CAPABILITIES.setDefault
                          ? "Set as default"
                          : "Set default is not supported by the server yet"
                      }
                      aria-disabled={!ADDRESS_CAPABILITIES.setDefault}
                    >
                      Set default
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!ADDRESS_CAPABILITIES.delete}
                      title={
                        ADDRESS_CAPABILITIES.delete
                          ? "Delete address"
                          : "Delete is not supported by the server yet"
                      }
                      aria-disabled={!ADDRESS_CAPABILITIES.delete}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[18px] border border-dashed border-border p-5">
              <Button
                size="sm"
                disabled={!ADDRESS_CAPABILITIES.create}
                title={
                  ADDRESS_CAPABILITIES.create
                    ? "Add address"
                    : "Add address is not supported by the server yet"
                }
                aria-disabled={!ADDRESS_CAPABILITIES.create}
              >
                Add address
              </Button>
              {!ADDRESS_CAPABILITIES.create ? (
                <p className="mt-2 text-xs text-muted">
                  New addresses are saved when you complete checkout.
                </p>
              ) : null}
            </div>
          </div>
        </QueryState>
      </ProfileShell>
    </RequireAuth>
  );
}
