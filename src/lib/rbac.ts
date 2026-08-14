import type { Role } from "./validation";

/**
 * Central place for "who can do what" so the UI and API routes agree.
 * Kept free of server-only imports so client components can import it too.
 */
export const permissions = {
  manageVehicles: (role: Role) => role === "MANAGER" || role === "ADMIN",
  manageMaintenance: (role: Role) => role === "MANAGER" || role === "ADMIN",
  viewAllFuelLogs: (role: Role) => role === "MANAGER" || role === "ADMIN",
  deleteFuelLogs: (role: Role) => role === "MANAGER" || role === "ADMIN",
  viewAnalytics: (role: Role) => role === "MANAGER" || role === "ADMIN",
  viewDrivers: (role: Role) => role === "MANAGER" || role === "ADMIN",
  /** Full user management: any role, role changes, sees admins/managers too. */
  manageUsers: (role: Role) => role === "ADMIN",
  /** Scoped driver management: view/add/approve/disable driver accounts
   * only. Managers get this so they can grow their own driver roster
   * without needing an admin for every hire. */
  manageDrivers: (role: Role) => role === "MANAGER" || role === "ADMIN",
  viewAuditLog: (role: Role) => role === "ADMIN",
};

export function roleLabel(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "System Admin";
    case "MANAGER":
      return "Fleet Manager";
    case "DRIVER":
      return "Driver";
  }
}
