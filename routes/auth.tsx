import { define } from "@/utils.ts";
import { authManager } from "@/utils/auth.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const token = ctx.url.searchParams.get("token");

    if (!token) {
      return new Response("Token is required", { status: 400 });
    }

    const authState = await authManager.validateSession(token);

    if (!authState.isAuthenticated) {
      return new Response("Invalid or expired token", { status: 401 });
    }

    // Устанавливаем cookie с токеном
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
    );

    // Перенаправляем на главную страницу
    headers.append("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  },
});
