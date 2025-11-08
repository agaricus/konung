/// <reference lib="deno.unstable" />

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

export class AuthManager {
  private kv: Deno.Kv | null = null;

  constructor() {
    this.initKv();
  }

  private async initKv() {
    this.kv = await Deno.openKv();
  }

  private async getKv(): Promise<Deno.Kv> {
    if (!this.kv) {
      this.kv = await Deno.openKv();
    }
    return this.kv;
  }

  async validateSession(token: string): Promise<AuthState> {
    try {
      const kv = await this.getKv();

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
    const kv = await this.getKv();
    await kv.delete(["sessions", token]);
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    const kv = await this.getKv();
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
    const kv = await this.getKv();
    const iter = kv.list<Session>({ prefix: ["sessions"] });
    const now = new Date();

    for await (const { key, value } of iter) {
      if (new Date(value.expiresAt) < now) {
        await kv.delete(key);
      }
    }
  }
}

export const authManager = new AuthManager();
