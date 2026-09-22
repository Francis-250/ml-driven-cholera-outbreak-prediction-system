import { UserRole } from "@prisma/client";

/**
 * System roles derived directly from Prisma schema's UserRole enum.
 * Only 'admin' and 'staff' exist in this system.
 */
export const ALLOWED_ROLES = Object.values(UserRole).map((r) =>
  r.toLowerCase()
) as unknown as readonly ["admin", "staff"];

export type AppRole = (typeof ALLOWED_ROLES)[number];

export function isValidRole(role: unknown): role is AppRole {
  return (
    typeof role === "string" &&
    (ALLOWED_ROLES as readonly string[]).includes(role.toLowerCase())
  );
}

export function normalizeRole(role?: string | null): AppRole {
  if (role && isValidRole(role)) {
    return role.toLowerCase() as AppRole;
  }
  return "staff";
}

export const ROLE_OPTIONS: { value: AppRole; label: string }[] = Object.values(
  UserRole
).map((role) => {
  const value = role.toLowerCase() as AppRole;
  return {
    value,
    label: value === "admin" ? "Administrator" : "Public Health Staff",
  };
});
