import { define } from "../../utils.ts";
import { authManager } from "../../utils/auth.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const token = ctx.url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const authState = await authManager.validateSession(token);

    if (!authState.isAuthenticated) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        user: authState.user,
        session: authState.session,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },

  async DELETE(ctx) {
    const token = ctx.url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await authManager.revokeSession(token);

    return new Response(
      JSON.stringify({ message: "Session revoked successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
});
