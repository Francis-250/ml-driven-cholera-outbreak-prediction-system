import type { UserRole } from "@prisma/client";

/**
 * System roles corresponding to Prisma schema's UserRole enum.
 * Only 'admin' and 'staff' exist in this system.
 *
 * NOTE: Defined as a constant array to guarantee safe evaluation in both
 * browser client components (where @prisma/client runtime objects are undefined)
 * and server environments without runtime evaluation errors.
 */
export const ALLOWED_ROLES = ["admin", "staff"] as const;

export type AppRole = (typeof ALLOWED_ROLES)[number];

// Compile-time assertion ensuring AppRole strictly mirrors Prisma UserRole
type ValidateRoleEnum = Uppercase<AppRole> extends UserRole
  ? UserRole extends Uppercase<AppRole>
    ? true
    : never
  : never;
const _validate: ValidateRoleEnum = true;

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

export const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "staff", label: "Public Health Staff" },
];
