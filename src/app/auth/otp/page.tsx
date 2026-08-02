"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/auth-shell";
import { useRouter } from "next/navigation";
import { otpSchema, type OtpFormValues } from "@/validators/auth.schema";
import {
  RECAPTCHA_CONTAINER_ID,
  postLoginPath,
  useSendOtp,
  useVerifyOtp,
} from "@/hooks/use-auth";
import { useToast } from "@/components/shared/toast";
import { ApiError } from "@/types/api";
import { resetPhoneRecaptcha } from "@/lib/firebase-auth";
import { useAuthStore } from "@/store";

export default function OtpLoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [destination, setDestination] = useState("");
  const router = useRouter();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const toast = useToast();
  const phoneForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });
  const codeForm = useForm<{ code: string }>({
    defaultValues: { code: "" },
  });

  useEffect(() => {
    return () => {
      resetPhoneRecaptcha();
    };
  }, []);

  return (
    <AuthShell title="OTP Login" subtitle="Sign in instantly with a one-time SMS code.">
      <div id={RECAPTCHA_CONTAINER_ID} className="flex justify-center py-2" />
      <p className="text-xs text-subtext">
        Complete the reCAPTCHA, then tap Send OTP. SMS needs Phone enabled + India allowed in
        Firebase Console (or a test phone number).
      </p>

      {step === "phone" ? (
        <form
          className="space-y-4"
          onSubmit={phoneForm.handleSubmit(async (v) => {
            try {
              setDestination(v.destination);
              await sendOtp.mutateAsync(v.destination);
              toast.success("OTP sent", "Check your SMS for the 6-digit code.");
              setStep("otp");
            } catch (err) {
              const message =
                err instanceof ApiError ? err.message : "Could not send OTP. Try again.";
              toast.error("OTP failed", message);
            }
          })}
        >
          <Input
            placeholder="Mobile number (10 digits)"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className="bg-white"
            aria-label="Mobile number"
            {...phoneForm.register("destination")}
          />
          {phoneForm.formState.errors.destination ? (
            <p className="text-xs text-danger">{phoneForm.formState.errors.destination.message}</p>
          ) : null}
          <p className="text-xs text-subtext">India numbers are prefixed with +91 automatically.</p>
          <CtaButton
            type="submit"
            label={sendOtp.isPending ? "Sending…" : "Send OTP"}
            className="w-full"
            loading={sendOtp.isPending}
            disabled={sendOtp.isPending}
          />
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={codeForm.handleSubmit(async (v) => {
            try {
              await verifyOtp.mutateAsync({ destination, code: v.code });
              const roles = useAuthStore.getState().user?.roles;
              toast.success("Welcome", "You are signed in.");
              router.push(postLoginPath(roles));
            } catch (err) {
              const message =
                err instanceof ApiError ? err.message : "Invalid or expired OTP.";
              toast.error("Verification failed", message);
            }
          })}
        >
          <p className="text-sm text-subtext">
            Code sent to <span className="text-white">{destination}</span>
          </p>
          <Input
            placeholder="Enter 6-digit OTP"
            className="bg-white tracking-[0.3em]"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="One-time password"
            {...codeForm.register("code", { required: true, minLength: 4 })}
          />
          <CtaButton
            type="submit"
            label={verifyOtp.isPending ? "Verifying…" : "Verify & Continue"}
            className="w-full"
            loading={verifyOtp.isPending}
            disabled={verifyOtp.isPending}
          />
          <button
            type="button"
            className="w-full text-center text-sm font-medium text-subtext hover:text-white"
            onClick={() => {
              resetPhoneRecaptcha();
              codeForm.reset();
              setStep("phone");
            }}
          >
            Change number
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-subtext">
        <Link href="/auth/login" className="font-semibold text-white hover:underline">
          Use password instead
        </Link>
      </p>
    </AuthShell>
  );
}
