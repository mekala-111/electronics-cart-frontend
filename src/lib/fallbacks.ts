import type { Product } from "@/types";

/** Static operational mocks used when admin/profile APIs are unavailable */
export const mockOrders = [
  { id: "EC-10482", date: "28 Jul 2026", total: 78990, status: "In transit" },
  { id: "EC-10391", date: "12 Jul 2026", total: 44990, status: "Delivered" },
  { id: "EC-10211", date: "02 Jun 2026", total: 99990, status: "Delivered" },
] as const;

export const mockAdminOrders = [
  { id: "EC-10482", customer: "Ananya R.", total: 79089, status: "Shipped" },
  { id: "EC-10481", customer: "Karthik R.", total: 56990, status: "Packed" },
  { id: "EC-10480", customer: "Meera S.", total: 38990, status: "Pending" },
  { id: "EC-10470", customer: "Rahul K.", total: 124990, status: "Delivered" },
  { id: "EC-10455", customer: "Sneha P.", total: 44990, status: "Returned" },
  { id: "EC-10440", customer: "Vikram N.", total: 52990, status: "Refunded" },
] as const;

export const mockCustomers = [
  { name: "Ananya Reddy", email: "ananya@example.com", orders: 4, ltv: 214000 },
  { name: "Karthik Rao", email: "karthik@example.com", orders: 2, ltv: 98000 },
  { name: "Meera Shah", email: "meera@example.com", orders: 6, ltv: 312000 },
] as const;

export const mockInvoices = [
  { id: "INV-10482", order: "EC-10482", amount: 78990 },
  { id: "INV-10391", order: "EC-10391", amount: 44990 },
  { id: "INV-10211", order: "EC-10211", amount: 99990 },
] as const;

export const mockNotifications = [
  "Your order EC-10482 is out for delivery.",
  "Flash deal ends in 3 hours — Lenovo ThinkPad T14.",
  "Warranty claim #WR-441 update: under review.",
] as const;

export const mockAddress = {
  label: "Home",
  line1: "12-4-88, Banjara Hills",
  city: "Hyderabad",
  state: "Telangana",
  postalCode: "500034",
  phone: "+91 98765 43210",
};

export const mockWarranty = {
  device: 'MacBook Air M2 13"',
  serial: "EC-MB-8821",
  expires: "28 Jul 2027",
  status: "Active",
};

export const mockTicket = {
  id: "TKT-2201",
  subject: "Battery health query",
  status: "Open",
};

export const mockAdminKpis = [
  { label: "Revenue", value: "₹42.8L" },
  { label: "Orders", value: "1,284" },
  { label: "AOV", value: "₹33.4K" },
  { label: "Conversion", value: "3.8%" },
] as const;

export const mockInventory = {
  units: 4280,
  warehouses: ["Hyderabad DC", "Bengaluru DC", "Mumbai DC"],
  lowStock: 18,
};

export function findMockProduct(id: string, catalog: Product[]): Product {
  return catalog.find((p) => p.id === id) ?? catalog[0];
}
