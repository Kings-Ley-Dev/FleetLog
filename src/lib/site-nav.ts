/** Public site navigation, shared by PublicNavbar and PublicFooter so
 * the two never drift out of sync. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const SOCIAL_LINKS = [
  { platform: "facebook", href: "#", label: "Facebook" },
  { platform: "twitter", href: "#", label: "Twitter / X" },
  { platform: "instagram", href: "#", label: "Instagram" },
  { platform: "linkedin", href: "#", label: "LinkedIn" },
] as const;
