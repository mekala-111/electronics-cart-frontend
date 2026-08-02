"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/features/auth/auth-shell";
import { useCompleteGoogleRedirect, useGoogleSignIn, useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/types/api";
import { registerSchema, type RegisterFormValues } from "@/validators/auth.schema";
import { useToast } from "@/components/shared/toast";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const googleMutation = useGoogleSignIn();
  useCompleteGoogleRedirect({ successPath: "/profile" });
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  return (
    <AuthShell title="Create your account" subtitle="Join Electronics Cart for deals & warranty tracking.">
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(async (v) => {
          try {
            await registerMutation.mutateAsync({
              email: v.email,
              password: v.password,
              name: v.name,
            });
            toast.success("Welcome", "Your account is ready.");
            router.push("/profile");
          } catch (err) {
            const apiErr = err instanceof ApiError ? err : null;
            const taken =
              apiErr?.status === 409 ||
              apiErr?.code === "AUTH_EMAIL_TAKEN" ||
              apiErr?.code === "CONFLICT";
            const message = taken
              ? "This email is already registered. Sign in instead (or use Continue with Google)."
              : apiErr?.message || "Registration failed";
            setError("email", { message });
            toast.error(taken ? "Account exists" : "Registration failed", message);
          }
        })}
      >
        <Input placeholder="Full name" autoComplete="name" className="bg-white" {...register("name")} />
        {errors.name ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
        <Input placeholder="Email" type="email" autoComplete="email" className="bg-white" {...register("email")} />
        {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
        <Input placeholder="Password" type="password" autoComplete="new-password" className="bg-white" {...register("password")} />
        {errors.password ? <p className="text-xs text-danger">{errors.password.message}</p> : null}
        <Input placeholder="Confirm password" type="password" autoComplete="new-password" className="bg-white" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="text-xs text-danger">{errors.confirmPassword.message}</p> : null}
        <CtaButton
          type="submit"
          label={registerMutation.isPending ? "Creating…" : "Create Account"}
          className="w-full"
          disabled={registerMutation.isPending}
        />
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-subtext">
        <span className="h-px flex-1 bg-white/20" /> OR <span className="h-px flex-1 bg-white/20" />
      </div>
      <CtaButton
        type="button"
        label={googleMutation.isPending ? "Connecting…" : "Continue with Google"}
        variant="secondary"
        className="w-full"
        loading={googleMutation.isPending}
        onClick={async () => {
          try {
            const data = await googleMutation.mutateAsync();
            if (!data) return;
            toast.success("Welcome", "You are signed in with Google.");
            router.push("/profile");
          } catch (err) {
            const message =
              err instanceof ApiError ? err.message : "Google sign-in failed.";
            toast.error("Sign in failed", message);
          }
        }}
      />
      <p className="mt-6 text-center text-sm text-subtext">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-white hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
