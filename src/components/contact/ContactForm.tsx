"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          subject: String(form.get("subject") || ""),
          message: String(form.get("message") || ""),
        }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald/20 bg-emerald-soft p-8 text-center">
        <CheckCircle2 className="size-8 text-emerald" />
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-emerald-deep">
          Message sent
        </p>
        <p className="text-sm text-emerald-deep/80">
          Thanks for reaching out — our support team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input name="name" label="Your name" placeholder="Kingsley Quarshie" required />
        <Input name="email" label="Email" type="email" placeholder="kq@example.com" required />
      </div>
      <Input name="subject" label="Subject" placeholder="Trouble logging fuel for a vehicle" required />
      <Textarea
        name="message"
        label="Message"
        placeholder="Tell us what's going on and we'll help you sort it out…"
        className="min-h-36"
        required
      />
      {error && <p className="text-sm font-medium text-rose">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="self-start">
        Send message
      </Button>
    </form>
  );
}
