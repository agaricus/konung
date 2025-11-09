import { Bot } from "@gramio/core";
import { Scene, scenes } from "@gramio/scenes";
import { z } from "@zod/zod";
import { DenoKvStorage } from "@/utils/deno-kv-storage.ts";

// Zod схемы для валидации
const userNameSchema = z.string().min(1, "Имя не может быть пустым").max(
  50,
  "Имя слишком длинное",
);
const userAgeSchema = z.number().int().min(1, "Возраст должен быть от 1 года")
  .max(100, "Возраст должен быть до 100 лет");

// Тип для состояния сцены
interface SceneState {
  userName?: string;
  userAge?: number;
}

// Bot session storage
const botSessionStorage = new DenoKvStorage(undefined, ["bot", "sessions"]);

// Bot session data interface
interface BotSessionData {
  authenticated: boolean;
  userId: number | null;
  userName?: string;
  userAge?: number;
  createdAt?: string;
  lastActivity?: string;
}

// Session management functions
async function getBotSession(userId: number): Promise<BotSessionData> {
  const session = await botSessionStorage.get(
    `user:${userId}`,
  ) as BotSessionData;
  return session || { authenticated: false, userId: null };
}

async function setBotSession(
  userId: number,
  data: Partial<BotSessionData>,
): Promise<void> {
  const currentSession = await getBotSession(userId);
  const updatedSession = {
    ...currentSession,
    ...data,
    lastActivity: new Date().toISOString(),
  };
  await botSessionStorage.set(`user:${userId}`, updatedSession);
}

async function clearBotSession(userId: number): Promise<void> {
  await botSessionStorage.delete(`user:${userId}`);
}

// Генерация токена сессии
function generateSessionToken(): string {
  return crypto.randomUUID();
}

// Сцена для основного взаимодействия
const mainScene = new Scene("main")
  .ask(
    "userName",
    userNameSchema,
    "Добро пожаловать в MiniApp! Введите ваше имя:",
  )
  .ask(
    "userAge",
    userAgeSchema,
    "Введите ваш возраст:",
  )
  .step("message", async (context) => {
    const state = context.scene.state as SceneState;

    // Генерируем токен сессии
    const sessionToken = generateSessionToken();

    // Сохраняем данные в Deno KV
    if (context.from) {
      const kv = await Deno.openKv();

      // Сохраняем профиль пользователя
      await kv.set(["users", context.from.id], {
        id: context.from.id,
        name: state.userName,
        age: state.userAge,
        username: context.from.username,
        firstName: context.from.firstName,
        lastName: context.from.lastName,
        registered: new Date().toISOString(),
      });

      // Сохраняем веб-сессию
      await kv.set(["sessions", sessionToken], {
        userId: context.from.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      });

      // Сохраняем бот-сессию
      await setBotSession(context.from.id, {
        authenticated: true,
        userId: context.from.id,
        userName: state.userName,
        userAge: state.userAge,
        createdAt: new Date().toISOString(),
      });

      await context.send(
        `Приятно познакомиться! Вас зовут ${state.userName}, вам ${state.userAge} лет.\n\nВаша сессия создана. Токен: \`${sessionToken}\`\n\nТеперь вы можете использовать этот токен для аутентификации в MiniApp.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{
              text: "Открыть MiniApp",
              web_app: {
                url: `https://konung.deno.dev?token=${sessionToken}`,
              },
            }]],
          },
        },
      );
    }

    return context.scene.exit();
  });

// Команда для генерации нового токена
const authScene = new Scene("auth")
  .step("message", async (context) => {
    if (context.scene.step.firstTime) {
      return context.send("Генерирую новый токен для доступа к MiniApp...");
    }

    if (context.from) {
      const sessionToken = generateSessionToken();
      const kv = await Deno.openKv();

      // Проверяем что пользователь существует
      const user = await kv.get(["users", context.from.id]);
      if (!user.value) {
        return context.send(
          "Сначала пройдите регистрацию через команду /start",
        );
      }

      // Сохраняем новую веб-сессию
      await kv.set(["sessions", sessionToken], {
        userId: context.from.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Обновляем бот-сессию
      await setBotSession(context.from.id, {
        lastActivity: new Date().toISOString(),
      });

      await context.send(
        `Новый токен доступа: \`${sessionToken}\`\n\nТокен действителен 24 часа. Используйте его для входа в MiniApp.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{
              text: "Открыть MiniApp",
              web_app: {
                url: `https://konung.deno.dev?token=${sessionToken}`,
              },
            }]],
          },
        },
      );
    }

    return context.scene.exit();
  });

// Команда для просмотра профиля
const profileScene = new Scene("profile")
  .step("message", async (context) => {
    if (context.from) {
      const session = await getBotSession(context.from.id);

      if (!session.authenticated) {
        return context.send(
          "Вы не авторизованы. Пройдите регистрацию через команду /start",
        );
      }

      await context.send(
        `👤 Ваш профиль:\n` +
          `Имя: ${session.userName}\n` +
          `Возраст: ${session.userAge}\n` +
          `ID: ${session.userId}\n` +
          `Последняя активность: ${session.lastActivity || "Неизвестно"}`,
      );
    }

    return context.scene.exit();
  });

// Команда для выхода
const logoutScene = new Scene("logout")
  .step("message", async (context) => {
    if (context.from) {
      await clearBotSession(context.from.id);
      await context.send(
        "Вы вышли из системы. Используйте /start для повторной авторизации.",
      );
    }

    return context.scene.exit();
  });

// Инициализация бота
export const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN")!)
  .extend(scenes([mainScene, authScene, profileScene, logoutScene]))
  .command("start", (context) => context.scene.enter(mainScene))
  .command("auth", (context) => context.scene.enter(authScene))
  .command("profile", (context) => context.scene.enter(profileScene))
  .command("logout", (context) => context.scene.enter(logoutScene))
  .command("menu", (context) => {
    return context.send(
      "📋 Меню:\n" +
        "/start - Регистрация и создание сессии\n" +
        "/auth - Получить новый токен доступа\n" +
        "/profile - Посмотреть профиль\n" +
        "/logout - Выйти из системы\n" +
        "/menu - Показать это меню",
    );
  });
