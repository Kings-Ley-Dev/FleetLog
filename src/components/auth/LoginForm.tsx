"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";

/** Sign-in form shared by the public /login page and the admin/manager
 * portal pages — credentials are the real access control here, so the
 * same endpoint and form work everywhere a person might sign in. */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });
      const next = redirectTo ?? searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="email" label="Email" type="email" placeholder="kq@fleetlog.gh" autoComplete="email" required />
      <Input name="password" label="Password" type="password" autoComplete="current-password" required />
      {error && <p className="text-sm font-medium text-rose">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="mt-1">
        Sign in
      </Button>
    </form>
  );
}
