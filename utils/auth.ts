export interface User {
  id: number;
  name: string;
  age: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  registered: string;
}

export interface Session {
  userId: number;
  createdAt: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

// Bot session data interface
export interface BotSessionData {
  authenticated: boolean;
  userId: number | null;
  userName?: string;
  userAge?: number;
}

// Session manager for web authentication
export class BotSessionManager {
  async validateSession(token: string): Promise<AuthState> {
    try {
      const kv = await Deno.openKv();

      // Получаем сессию
      const sessionResult = await kv.get<Session>(["sessions", token]);
      if (!sessionResult.value) {
        return { user: null, session: null, isAuthenticated: false };
      }

      const session = sessionResult.value;

      // Проверяем срок действия токена
      if (new Date(session.expiresAt) < new Date()) {
        await kv.delete(["sessions", token]);
        return { user: null, session: null, isAuthenticated: false };
      }

      // Получаем пользователя
      const userResult = await kv.get<User>(["users", session.userId]);
      if (!userResult.value) {
        return { user: null, session: null, isAuthenticated: false };
      }

      return {
        user: userResult.value,
        session,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error("Error validating session:", error);
      return { user: null, session: null, isAuthenticated: false };
    }
  }

  async revokeSession(token: string): Promise<void> {
    const kv = await Deno.openKv();
    await kv.delete(["sessions", token]);
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    const kv = await Deno.openKv();
    const sessions: Session[] = [];
    const iter = kv.list<Session>({ prefix: ["sessions"] });

    for await (const { value } of iter) {
      if (value.userId === userId) {
        sessions.push(value);
      }
    }

    return sessions;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const kv = await Deno.openKv();
    const iter = kv.list<Session>({ prefix: ["sessions"] });
    const now = new Date();

    for await (const { key, value } of iter) {
      if (new Date(value.expiresAt) < now) {
        await kv.delete(key);
      }
    }
  }
}

export const botSessionManager = new BotSessionManager();
export const authManager = botSessionManager; // Backward compatibility
