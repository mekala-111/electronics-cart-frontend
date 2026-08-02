"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/auth-shell";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/validators/auth.schema";
import { useForgotPassword } from "@/hooks/use-auth";
import { useToast } from "@/components/shared/toast";
import { ApiError } from "@/types/api";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const mutation = useForgotPassword();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  return (
    <AuthShell title="Reset password" subtitle="We’ll send a reset code to your email or mobile.">
      {sent ? (
        <div className="rounded-[16px] border border-white/20 bg-white/10 p-4 text-sm text-subtext">
          If an account exists, a reset code has been sent. Check your inbox or SMS.
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (v) => {
            try {
              await mutation.mutateAsync(v.identifier);
              setSent(true);
            } catch (err) {
              const message =
                err instanceof ApiError ? err.message : "Unable to send reset code. Try again.";
              toast.error("Reset failed", message);
            }
          })}
          noValidate
        >
          <Input
            placeholder="Email or mobile"
            className="bg-white"
            {...register("identifier")}
          />
          {errors.identifier ? (
            <p className="text-xs text-danger">{errors.identifier.message}</p>
          ) : null}
          <CtaButton
            type="submit"
            label={mutation.isPending ? "Sending…" : "Send reset link"}
            className="w-full"
            disabled={mutation.isPending}
          />
        </form>
      )}
      <p className="mt-6 text-center text-sm text-subtext">
        <Link href="/auth/login" className="font-semibold text-white hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
