export function roleHome(role?: string | null) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin";
    case "staff":
      return "/staff";
    default:
      return "/";
  }
}

export function roleForPath(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/staff" || pathname.startsWith("/staff/")) return "staff";
  return null;
}
