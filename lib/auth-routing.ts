export function roleHome(role?: string | null) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin";
    case "staff":
    case "doctor":
    case "community":
    case "community_user":
    case "patient":
      return "/staff";
    default:
      return "/";
  }
}

export function roleForPath(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/staff" || pathname.startsWith("/staff/")) return "staff";
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) return "staff";
  if (pathname === "/community" || pathname.startsWith("/community/")) return "staff";
  if (pathname === "/patient" || pathname.startsWith("/patient/")) return "staff";
  return null;
}
