export type AdminRole =
  | "superadmin"
  | "admin"
  | "customer_care"
  | "customer_support";

export const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "customer_care", label: "Customer care" },
  { value: "customer_support", label: "Customer support" },
];

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((role) => [role.value, role.label]),
);

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
