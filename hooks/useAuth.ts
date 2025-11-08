import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type AuthState } from "@/utils/auth.ts";

export function useAuth() {
  const authState = useSignal<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
  });

  const checkAuth = async () => {
    try {
      const cookies = document.cookie.split(";");
      let token = "";

      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "auth_token") {
          token = value;
          break;
        }
      }

      if (token) {
        const response = await fetch(`/api/auth?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          authState.value = {
            user: data.user,
            session: data.session,
            isAuthenticated: true,
          };
        } else {
          authState.value = {
            user: null,
            session: null,
            isAuthenticated: false,
          };
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      authState.value = {
        user: null,
        session: null,
        isAuthenticated: false,
      };
    }
  };

  const logout = async () => {
    try {
      const cookies = document.cookie.split(";");
      let token = "";

      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "auth_token") {
          token = value;
          break;
        }
      }

      if (token) {
        await fetch(`/api/auth?token=${token}`, { method: "DELETE" });
      }

      // Удаляем cookie
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      authState.value = {
        user: null,
        session: null,
        isAuthenticated: false,
      };
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    authState: authState.value,
    checkAuth,
    logout,
  };
}
