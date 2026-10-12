export type AdminRole =
  | "superadmin"
  | "admin"
  | "customer_care"
  | "customer_support";

export type StaffRole = "Superadmin" | "Admin" | "Viewer";

export const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "customer_care", label: "Customer care" },
  { value: "customer_support", label: "Customer support" },
];

export const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "Superadmin", label: "Superadmin" },
  { value: "Admin", label: "Admin" },
  { value: "Viewer", label: "Viewer" },
];

export const ROLE_LABELS: Record<string, string> = {
  ...Object.fromEntries(ROLE_OPTIONS.map((role) => [role.value, role.label])),
  ...Object.fromEntries(
    STAFF_ROLE_OPTIONS.map((role) => [role.value, role.label]),
  ),
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: [
    "Full access",
    "Manage admins",
    "Manage products",
    "Manage orders",
    "View customers",
    "Messages",
  ],
  admin: [
    "Manage products",
    "Manage orders",
    "Invite users",
    "View customers",
    "Messages",
  ],
  customer_care: ["Manage orders", "View customers", "Messages"],
  customer_support: ["View customers", "Messages"],
};

export function canWrite(role: string) {
  return role === "Superadmin" || role === "Admin";
}

export function canManageTeam(role: string) {
  return role === "Superadmin" || role === "Admin";
}

export function canInviteRole(actorRole: string, targetRole: string) {
  if (actorRole === "Superadmin") return true;
  if (actorRole === "Admin") {
    return targetRole === "Admin" || targetRole === "Viewer";
  }
  return false;
}

export function isValidRole(role: string): role is StaffRole {
  return STAFF_ROLE_OPTIONS.some((option) => option.value === role);
}
