import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    "Use upper, lower, number, and special character",
  );

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    password: strongPassword,
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, "Enter email or mobile"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  destination: z.string().min(8, "Enter a valid phone number"),
  code: z.string().min(4, "Enter the OTP").max(8).optional(),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const checkoutAddressSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  postalCode: z.string().min(4, "PIN required"),
  country: z.string().min(2, "Country required"),
});

export type CheckoutAddressFormValues = z.infer<typeof checkoutAddressSchema>;

/** Seed / legacy IDs are UUID-shaped but not always RFC version 1–5. */
const uuidShaped = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Fulfillment warehouse required",
  );

/** Full checkout wizard — address + delivery + payment selections */
export const checkoutFormSchema = checkoutAddressSchema.extend({
  shippingMethodId: z.string().min(1, "Select a delivery option"),
  paymentMethodId: z.string().min(1, "Select a payment method"),
  warehouseId: uuidShaped,
  couponCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const supportTicketSchema = z.object({
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(10, "Please describe the issue"),
  email: z.string().email().optional(),
});

export type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;
