import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Fuel, Car, Wrench, Users, ScrollText, UserCircle } from "lucide-react";
import type { Role } from "./validation";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "DRIVER"] },
  { href: "/dashboard/fuel-logs", label: "Fuel Logs", icon: Fuel, roles: ["ADMIN", "MANAGER", "DRIVER"] },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Car, roles: ["ADMIN", "MANAGER", "DRIVER"] },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/audit", label: "Audit Log", icon: ScrollText, roles: ["ADMIN"] },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle, roles: ["ADMIN", "MANAGER", "DRIVER"] },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
