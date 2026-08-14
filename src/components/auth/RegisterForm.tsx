"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";

interface RegisterFormProps {
  /** "driver": public signup, ends in a "pending approval" message.
   * "portal": admin/manager self-registration, auto-signs in on success. */
  mode: "driver" | "portal";
  endpoint: string;
  /** Required for mode="portal" — the secret URL segment, re-validated
   * server-side against the matching env var. */
  portalPath?: string;
}

export function RegisterForm({ mode, endpoint, portalPath }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          password,
          ...(portalPath ? { portalPath } : {}),
        }),
      });

      if (mode === "portal") {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald/20 bg-emerald-soft p-6 text-center">
        <CheckCircle2 className="size-8 text-emerald" />
        <p className="font-[family-name:var(--font-display)] text-base font-bold text-emerald-deep">
          Account created, pending approval
        </p>
        <p className="text-sm text-emerald-deep/80">
          A fleet manager or admin needs to approve your account before you can sign in. You can
          check back shortly, or we&apos;ll let your manager know to look out for your request.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input name="name" label="Full name" placeholder="Kingsley Quarshie" autoComplete="name" required />
      <Input name="email" label="Email" type="email" placeholder="kq@fleetlog.gh" autoComplete="email" required />
      <Input
        name="password"
        label="Password"
        type="password"
        minLength={8}
        autoComplete="new-password"
        hint="At least 8 characters."
        required
      />
      <Input
        name="confirmPassword"
        label="Confirm password"
        type="password"
        minLength={8}
        autoComplete="new-password"
        required
      />
      {error && <p className="text-sm font-medium text-rose">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="mt-1">
        Create account
      </Button>
    </form>
  );
}
