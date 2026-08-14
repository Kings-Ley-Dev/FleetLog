import type { SVGProps } from "react";

/**
 * Small, original line-style social icons (lucide-react dropped its
 * brand-icon set). Simplified geometric marks in the same stroke style
 * as the rest of the UI — not reproductions of any official logo asset.
 */

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M13.7 21v-7.2h2.2l.4-2.6h-2.6V9.4c0-.8.3-1.3 1.4-1.3h1.3V5.8c-.6-.1-1.3-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2h-2.2v2.6H11V21" />
    </Base>
  );
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </Base>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 11v6M8 8v.01" />
      <path d="M12 17v-4.5a2 2 0 0 1 4 0V17M12 12.5V17" />
    </Base>
  );
}
