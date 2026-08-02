"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CtaButton } from "@/components/shared/cta-button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/features/auth/auth-shell";
import { loginSchema, type LoginFormValues } from "@/validators/auth.schema";
import { postLoginPath, useGoogleSignIn, useLogin } from "@/hooks/use-auth";
import { useToast } from "@/components/shared/toast";
import { ApiError } from "@/types/api";
import { allowDemoAuth } from "@/lib/env";

const DemoAuthPanel = dynamic(
  () =>
    import("@/features/auth/demo-auth-panel").then((m) => m.DemoAuthPanel),
  { ssr: false },
);

function readNextPath() {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") ? next : null;
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleMutation = useGoogleSignIn();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to track orders, wishlist, and warranty.">
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (v) => {
          try {
            await loginMutation.mutateAsync({
              identifier: v.email,
              password: v.password,
            });
            const roles = useAuthStore.getState().user?.roles;
            const next = readNextPath();
            toast.success("Welcome back", "You are signed in.");
            router.push(next ?? postLoginPath(roles));
          } catch (err) {
            const apiErr = err instanceof ApiError ? err : null;
            const message =
              apiErr?.status === 401
                ? "Invalid email or password. If you used Google before, sign in with Google instead."
                : apiErr?.message || "Sign in failed. Check your credentials.";
            setError("password", { message });
            toast.error("Sign in failed", message);
          }
        })}
        noValidate
      >
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <Input id="email" placeholder="Email" type="email" autoComplete="email" className="bg-white" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            className="bg-white"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-subtext hover:text-white">
            Forgot password?
          </Link>
        </div>
        <CtaButton
          type="submit"
          label={loginMutation.isPending ? "Signing in…" : "Sign In"}
          className="w-full"
          loading={loginMutation.isPending}
        />
      </form>

      {allowDemoAuth ? <DemoAuthPanel setValue={setValue} /> : null}

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
            await googleMutation.mutateAsync();
            const roles = useAuthStore.getState().user?.roles;
            const next = readNextPath();
            toast.success("Welcome back", "You are signed in with Google.");
            router.push(next ?? postLoginPath(roles));
          } catch (err) {
            const message =
              err instanceof ApiError ? err.message : "Google sign-in failed.";
            toast.error("Sign in failed", message);
          }
        }}
      />
      <Link href="/auth/otp" className="mt-3 block">
        <CtaButton type="button" label="Login with OTP" variant="secondary" className="w-full" />
      </Link>

      <p className="mt-6 text-center text-sm text-subtext">
        New here?{" "}
        <Link href="/auth/register" className="font-semibold text-white hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
