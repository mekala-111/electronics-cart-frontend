import type { LegalSection } from "@/components/legal/legal-page";

export const LEGAL_UPDATED = "3 August 2026";

export type LegalSlug =
  | "terms"
  | "privacy"
  | "returns"
  | "shipping"
  | "warranty";

export const LEGAL_META: Record<
  LegalSlug,
  { title: string; description: string; sections: LegalSection[] }
> = {
  terms: {
    title: "Terms of Service",
    description:
      "Terms governing use of the Electronics Cart website and purchase of products.",
    sections: [
      {
        heading: "1. Agreement",
        body: [
          "By accessing electronicscart.in or placing an order with Electronics Cart (“we”, “us”), you agree to these Terms of Service. If you do not agree, do not use the site or place orders.",
          "We sell new and certified refurbished electronics (primarily laptops and related accessories) to customers in India. Orders are subject to availability, verification, and payment confirmation.",
        ],
      },
      {
        heading: "2. Accounts",
        body: [
          "You must provide accurate registration details and keep your login credentials secure. You are responsible for activity under your account.",
          "We may suspend or terminate accounts that violate these terms, appear fraudulent, or pose security risk.",
        ],
      },
      {
        heading: "3. Orders & pricing",
        body: [
          "Product listings, prices (INR), and stock shown on the site are invitations to offer and may change without notice until your order is confirmed.",
          "An order is accepted when we confirm it after successful payment authorisation (or COD acceptance where offered). We may cancel orders for pricing errors, stock issues, failed payment, or suspected fraud and will notify you.",
        ],
      },
      {
        heading: "4. Payment",
        body: [
          "Online payments are processed by our payment partner (Razorpay). Card/UPI/netbanking details are entered on Razorpay’s secure checkout and are not stored on our servers.",
          "You authorise us and our payment partner to charge the order total including applicable taxes and shipping.",
        ],
      },
      {
        heading: "5. Delivery",
        body: [
          "Delivery timelines are estimates. Risk of loss passes to you on delivery to the address you provide, except where law requires otherwise.",
          "You must provide a complete, serviceable address and reachable phone number. Failed delivery due to incorrect details may incur re-shipping charges.",
        ],
      },
      {
        heading: "6. Acceptable use",
        body: [
          "You may not misuse the site (scraping, attacking, reverse engineering, or using bots to abuse promotions). You may not purchase for unlawful resale where prohibited.",
        ],
      },
      {
        heading: "7. Liability",
        body: [
          "To the fullest extent permitted by Indian law, our liability for any claim relating to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses.",
          "Nothing in these terms excludes liability that cannot be limited under applicable law (including consumer protection statutes).",
        ],
      },
      {
        heading: "8. Governing law",
        body: [
          "These terms are governed by the laws of India. Courts in Hyderabad, Telangana shall have exclusive jurisdiction, subject to mandatory consumer forum rights.",
        ],
      },
      {
        heading: "9. Contact",
        body: [
          "Electronics Cart — support via the Help & Support page on this website. Business identity and GST details will be published on invoices and, where required, on this site.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Electronics Cart collects, uses, and protects your personal data under Indian law.",
    sections: [
      {
        heading: "1. Who we are",
        body: [
          "Electronics Cart operates an online storefront for electronics. This policy explains how we handle personal data when you browse, register, or buy from us.",
          "We process data in line with the Digital Personal Data Protection Act, 2023 (DPDP Act) and other applicable Indian laws.",
        ],
      },
      {
        heading: "2. Data we collect",
        body: [
          "Account data: name, email, phone, password hashes (we never store plaintext passwords).",
          "Order data: shipping/billing address, GSTIN (if provided), order and payment status references from our payment partner.",
          "Technical data: device/browser type, IP address, session identifiers, and basic analytics events needed to run and secure the service.",
        ],
      },
      {
        heading: "3. Why we use data",
        body: [
          "To fulfil orders, arrange shipping, provide warranty/support, prevent fraud, send transactional emails/SMS (OTP, order updates), and improve the site.",
          "We do not sell your personal data. Marketing messages are sent only with consent or as otherwise permitted by law; you can opt out of non-essential marketing.",
        ],
      },
      {
        heading: "4. Sharing",
        body: [
          "We share data with processors who help us operate: payment (Razorpay), logistics (e.g. Shiprocket), email/SMS providers, cloud hosting, and fraud/security tools — only as needed to provide the service.",
          "We may disclose data when required by law, regulation, or lawful government request.",
        ],
      },
      {
        heading: "5. Retention & security",
        body: [
          "We retain account and order records as required for tax, warranty, and dispute resolution, then delete or anonymise when no longer needed.",
          "We use industry-standard safeguards (HTTPS, access controls, hashed credentials). No method of transmission is 100% secure.",
        ],
      },
      {
        heading: "6. Your rights",
        body: [
          "Subject to law, you may request access, correction, or deletion of your personal data, and withdraw consent where processing is consent-based.",
          "Contact us via Help & Support. You may also escalate to the Data Protection Board of India as provided under the DPDP Act.",
        ],
      },
      {
        heading: "7. Cookies",
        body: [
          "We use essential cookies/local storage for login sessions and cart continuity. Analytics cookies, if enabled later, will be disclosed and controllable where required.",
        ],
      },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    description:
      "Electronics Cart return window, refund process, and non-returnable conditions.",
    sections: [
      {
        heading: "1. Return window",
        body: [
          "Eligible products may be returned within 7 days of delivery if unused, in original packaging, with all accessories, and with the invoice.",
          "Refurbished units must match the graded condition disclosed at purchase. Cosmetic wear consistent with the listed grade is not a defect.",
        ],
      },
      {
        heading: "2. Non-returnable",
        body: [
          "Products damaged by misuse, liquid damage, missing parts, activated software licences that cannot be transferred, or items marked final sale.",
          "Returns requested after the window without a valid warranty/RMA claim.",
        ],
      },
      {
        heading: "3. How to request",
        body: [
          "Open a return/RMA request from your account (Orders / Warranty) or via Help & Support with order ID and reason. We may require photos or a diagnostic check.",
          "Approved returns receive a pickup or drop-off instruction. Do not ship products back without authorisation.",
        ],
      },
      {
        heading: "4. Refunds",
        body: [
          "After inspection and approval, refunds are issued to the original payment method within 5–10 business days (bank/UPI timelines may vary).",
          "Shipping fees are refundable only if the return is due to our error (wrong/defective item). COD orders are refunded by bank transfer/UPI after verification.",
        ],
      },
      {
        heading: "5. Cancellations",
        body: [
          "You may cancel before dispatch. After dispatch, use the return process on delivery. Payment gateway fees for cancelled prepaid orders are handled per our payment partner’s rules and our confirmation email.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    description:
      "Delivery areas, timelines, and shipping charges for Electronics Cart orders in India.",
    sections: [
      {
        heading: "1. Service area",
        body: [
          "We ship across India to serviceable pincodes via our logistics partners. Some remote locations may be unavailable or take longer.",
        ],
      },
      {
        heading: "2. Processing & delivery",
        body: [
          "Orders are typically processed within 1–2 business days after payment confirmation (or COD verification).",
          "Estimated delivery is usually 2–7 business days depending on destination and courier. Estimates shown at checkout are not guarantees.",
        ],
      },
      {
        heading: "3. Charges",
        body: [
          "Shipping charges (if any) are calculated at checkout based on destination, weight, and selected method. Promotional free-shipping offers will be shown clearly when applicable.",
        ],
      },
      {
        heading: "4. Tracking",
        body: [
          "Tracking details are shared by email/SMS and in your account once the shipment is created. Delays due to weather, strikes, or courier capacity are outside our direct control; we will help escalate with the carrier.",
        ],
      },
      {
        heading: "5. Failed delivery",
        body: [
          "If delivery fails due to an incomplete address or unreachable recipient, the courier may attempt redelivery or return the parcel. Additional shipping fees may apply for re-attempts.",
        ],
      },
    ],
  },
  warranty: {
    title: "Warranty Policy",
    description:
      "Warranty coverage for new and refurbished products sold by Electronics Cart.",
    sections: [
      {
        heading: "1. Coverage",
        body: [
          "Warranty duration and type (brand / seller / extended) are shown on each product page and on your order invoice. Refurbished units include the warranty stated at purchase for manufacturing defects under normal use.",
          "Warranty covers hardware defects; it does not cover accidental damage, liquid damage, unauthorised repairs, or consumables unless explicitly stated.",
        ],
      },
      {
        heading: "2. Claims",
        body: [
          "Register the product and open a claim from Profile → Warranty or Help & Support. Keep your invoice and serial number ready.",
          "We may diagnose remotely, arrange pickup, or direct you to an authorised service centre depending on the plan.",
        ],
      },
      {
        heading: "3. Remedies",
        body: [
          "At our or the brand’s discretion, remedies may include repair, replacement with equivalent condition, or store credit/refund where required by law or the plan terms.",
        ],
      },
      {
        heading: "4. Void conditions",
        body: [
          "Warranty is void if the serial sticker is removed, the device is tampered with, or damage is caused by misuse, power surges without adequate protection, or third-party software issues unrelated to supplied hardware.",
        ],
      },
    ],
  },
};

export const LEGAL_SLUGS = Object.keys(LEGAL_META) as LegalSlug[];

export function isLegalSlug(value: string): value is LegalSlug {
  return value in LEGAL_META;
}
