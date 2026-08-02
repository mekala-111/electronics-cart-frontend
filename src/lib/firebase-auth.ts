import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { AuthSessionResponse, SessionUser } from "@/types/auth";
import { ApiError } from "@/types/api";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let phoneConfirmation: ConfirmationResult | null = null;

function mapFirebaseError(error: unknown): ApiError {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "auth/unknown";
  const rawMessage =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: string }).message)
      : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/unauthorized-domain": "This domain is not authorized for Firebase Auth.",
    "auth/invalid-phone-number": "Enter a valid mobile number with country code.",
    "auth/missing-phone-number": "Enter a mobile number.",
    "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
    "auth/captcha-check-failed": "reCAPTCHA verification failed. Refresh and try again.",
    "auth/invalid-verification-code": "Invalid or expired OTP.",
    "auth/code-expired": "OTP expired. Request a new code.",
    "auth/missing-verification-code": "Enter the OTP from your SMS.",
    "auth/operation-not-allowed":
      "Phone sign-in is not enabled. Enable Phone in Firebase Console → Authentication.",
    "auth/billing-not-enabled":
      "Firebase Phone Auth needs Blaze billing (or add a test phone number in Console).",
  };

  let message = messages[code];
  if (!message && /billing/i.test(rawMessage)) {
    message = messages["auth/billing-not-enabled"];
  }
  if (!message && /SMS region|blocked.*region|REGION/i.test(rawMessage)) {
    message =
      "SMS to this country is blocked. Allow India (IN) under Authentication → Settings → SMS region policy.";
  }
  if (!message) {
    message = rawMessage
      ? rawMessage.replace(/^Firebase:\s*/i, "").replace(/\s*\([^)]*\)\.?\s*$/, "")
      : "Authentication failed. Please try again.";
  }

  return new ApiError({
    message,
    code,
    status: 401,
  });
}

/** Normalize Indian / E.164 phone input for Firebase. */
export function toE164Phone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "").trim();
  if (digits.startsWith("+")) return digits;
  const only = digits.replace(/\D/g, "");
  if (only.length === 10) return `+91${only}`;
  if (only.length === 12 && only.startsWith("91")) return `+${only}`;
  if (only.length > 10) return `+${only}`;
  throw new ApiError({
    message: "Enter a valid 10-digit mobile number",
    code: "auth/invalid-phone-number",
    status: 400,
  });
}

export function firebaseUserToSession(user: User): SessionUser {
  return {
    id: user.uid,
    name: user.displayName || user.phoneNumber || user.email || "Customer",
    email: user.email || user.phoneNumber || "",
    roles: [],
  };
}

async function toSessionResponse(user: User): Promise<AuthSessionResponse> {
  const accessToken = await user.getIdToken();
  const refreshToken = user.refreshToken;
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.uid,
      email: user.email,
      mobile: user.phoneNumber,
      name: user.displayName || user.phoneNumber || user.email,
      emailVerified: user.emailVerified,
      roles: [],
    },
    roles: [],
  };
}

export async function firebaseLogin(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return toSessionResponse(cred.user);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function firebaseRegister(
  email: string,
  password: string,
  name?: string,
) {
  try {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );
    if (name?.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    return toSessionResponse(cred.user);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function firebaseGoogleSignIn() {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(getFirebaseAuth(), provider);
    return toSessionResponse(cred.user);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function firebaseLogout() {
  await signOut(getFirebaseAuth());
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function firebaseCurrentSession(): Promise<AuthSessionResponse | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return toSessionResponse(user);
}

function clearRecaptcha() {
  try {
    recaptchaVerifier?.clear();
  } catch {
    /* ignore */
  }
  recaptchaVerifier = null;
}

/** Create (or reuse) a visible reCAPTCHA widget for phone auth. */
export function getOrCreateRecaptcha(containerId: string): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new ApiError({
      message: "Phone auth is only available in the browser",
      code: "auth/unavailable",
      status: 500,
    });
  }
  if (recaptchaVerifier) return recaptchaVerifier;

  const el = document.getElementById(containerId);
  if (el) el.innerHTML = "";

  const auth = getFirebaseAuth();
  auth.useDeviceLanguage();
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "normal",
    callback: () => {
      /* solved — signInWithPhoneNumber continues */
    },
    "expired-callback": () => {
      clearRecaptcha();
    },
  });
  return recaptchaVerifier;
}

export function resetPhoneRecaptcha() {
  clearRecaptcha();
  phoneConfirmation = null;
}

/** Send SMS OTP via Firebase Phone Auth. */
export async function firebaseSendOtp(phoneRaw: string, containerId: string) {
  try {
    const phone = toE164Phone(phoneRaw);
    clearRecaptcha();
    const verifier = getOrCreateRecaptcha(containerId);
    await verifier.render();
    phoneConfirmation = await signInWithPhoneNumber(
      getFirebaseAuth(),
      phone,
      verifier,
    );
    return { message: "OTP sent", phone };
  } catch (error) {
    clearRecaptcha();
    phoneConfirmation = null;
    throw mapFirebaseError(error);
  }
}

/** Confirm SMS OTP and return a session. */
export async function firebaseVerifyOtp(code: string) {
  if (!phoneConfirmation) {
    throw new ApiError({
      message: "Request an OTP first",
      code: "auth/missing-confirmation",
      status: 400,
    });
  }
  try {
    const cred = await phoneConfirmation.confirm(code.trim());
    phoneConfirmation = null;
    clearRecaptcha();
    return toSessionResponse(cred.user);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}
