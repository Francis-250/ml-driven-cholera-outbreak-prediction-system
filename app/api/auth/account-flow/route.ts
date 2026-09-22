import { getServerSession } from "@/hooks/get-server-session";
import { roleHome } from "@/lib/auth-routing";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as { operation?: string };

    if (input.operation === "post-login-destination") {
      const session = await getServerSession();
      if (!session?.user) {
        return Response.json(
          { error: "Authentication required." },
          { status: 401 },
        );
      }
      return Response.json({
        destination: roleHome(session.user.role),
        blocked: false,
        reason: null,
      });
    }

    return Response.json({ error: "Invalid operation." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
