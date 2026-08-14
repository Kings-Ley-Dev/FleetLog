import Link from "next/link";
import { LogoMark } from "@/components/icons/Logo";
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "@/components/icons/SocialIcons";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/site-nav";

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
} as const;

export function PublicFooter() {
  return (
    <footer className="bg-obsidian p-5 pt-14 pb-8 text-white/60 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl mt-5 mb-3">
        {/* Evenly distributed 3-column Grid layout */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-3">
          
          {/* Column 1: Brand Info */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="FleetLog home">
              <LogoMark />
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                FleetLog
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Fuel and fleet expense tracking, built for transport operators in Ghana.
            </p>

            <div className="mt-5 mb-4 flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform];
                return (
                  <a
                    key={s.platform}
                    href={s.href}
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-mint/40 hover:text-mint"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Navigate Menu */}
          <div className="sm:justify-self-center">
            <p className="mb-3 text-sm font-semibold text-white">Navigate</p>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account Menu */}
          <div className="sm:justify-self-end">
            <p className="mb-3 text-sm font-semibold text-white">Account</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-white">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <p className="pt-6 text-xs text-center">
          © {new Date().getFullYear()} FleetLog - By Kingsley Quarshie.
        </p>
      </div>
    </footer>
  );
}
