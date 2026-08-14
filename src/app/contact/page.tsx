import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card } from "@/components/ui/Card";
import { Faq } from "@/components/ui/Faq";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the FleetLog support team.",
};

const FAQS = [
  {
    question: "How do I get access to FleetLog?",
    answer:
      "Drivers sign up from the Get Started button and are approved by their fleet manager or admin. Fleet managers and system admins are set up directly by their organization through a private registration link.",
  },
  {
    question: "I signed up as a driver but can't sign in yet, why?",
    answer:
      "New driver accounts start as pending until a fleet manager or admin approves them. This usually happens quickly if it's been a while, reach out to your fleet manager directly or contact support below.",
  },
  {
    question: "How is fuel efficiency calculated?",
    answer:
      "Every time you log fuel, FleetLog compares the new odometer reading to the vehicle's last one to get distance travelled, then divides that by the liters purchased for km/L, and divides the total cost by distance for cost-per-km.",
  },
  {
    question: "Can I use FleetLog on my phone?",
    answer:
      "Yes, the whole app is responsive and works well on a phone browser, which is how most drivers log fuel on the go.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Passwords are hashed and never stored in plain text, sessions use signed tokens in secure cookies, and every page and action is gated by your account's role.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Once signed in, go to Profile → Change password. If you're locked out entirely, ask your fleet manager or admin to help, or reach out to support using the form on this page.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicNavbar />

      <section className="bg-obsidian px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-mint">Contact</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
            We&apos;re happy to help
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Questions about your account, a fleet, or anything else, send us a message and our
            support team will get back to you.
          </p>
        </div>
      </section>

      <section className="bg-cream px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-slate">Our support team typically replies within one business day.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="p-6 sm:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">Get in touch</h2>
              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-soft text-emerald-deep">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">Phone</p>
                    <a href="tel:+233557272031" className="text-sm font-medium text-ink hover:text-emerald">
                      +233 55 727 2031
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-soft text-emerald-deep">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">Email</p>
                    <a
                      href="mailto:info.support@fleetlog.com"
                      className="text-sm font-medium text-ink hover:text-emerald"
                    >
                      info.support@fleetlog.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-soft text-emerald-deep">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">Location</p>
                    <p className="text-sm font-medium text-ink">Weija, Greater Accra Region, Ghana</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="overflow-hidden p-0">
              <iframe
                title="FleetLog location — Weija, Ghana"
                src="https://www.google.com/maps?q=5.5670,-0.3330&z=14&output=embed"
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-slate">Can&apos;t find what you&apos;re looking for? Send us a message above.</p>
          </div>
          <div className="mt-8">
            <Faq items={FAQS} />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
