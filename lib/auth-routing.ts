export function roleHome(role?: string | null) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "community":
    case "community_user":
    case "patient":
      return "/community";
    default:
      return "/";
  }
}

export function roleForPath(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/doctor" || pathname.startsWith("/doctor/")) return "doctor";
  if (pathname === "/community" || pathname.startsWith("/community/")) return "community";
  if (pathname === "/patient" || pathname.startsWith("/patient/")) return "community";
  return null;
}
