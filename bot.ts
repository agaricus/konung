/// <reference lib="deno.unstable" />

import { Bot } from "@gramio/core";
import { Scene, scenes } from "@gramio/scenes";
import { z } from "@zod/zod";

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

      // Сохраняем сессию
      await kv.set(["sessions", sessionToken], {
        userId: context.from.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      });

      await context.send(
        `Приятно познакомиться! Вас зовут ${state.userName}, вам ${state.userAge} лет.\n\n` +
          `Ваша сессия создана. Токен: \`${sessionToken}\`\n\n` +
          `Теперь вы можете использовать этот токен для аутентификации в MiniApp.`,
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

      // Сохраняем новую сессию
      await kv.set(["sessions", sessionToken], {
        userId: context.from.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      await context.send(
        `Новый токен доступа: \`${sessionToken}\`\n\n` +
          `Токен действителен 24 часа. Используйте его для входа в MiniApp.`,
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

// Инициализация бота
export const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN")!)
  .extend(scenes([mainScene, authScene]))
  .command("start", (context) => context.scene.enter(mainScene))
  .command("auth", (context) => context.scene.enter(authScene))
  .command("menu", (context) => {
    return context.send(
      "📋 Меню:\n" +
        "/start - Регистрация и создание сессии\n" +
        "/auth - Получить новый токен доступа\n" +
        "/menu - Показать это меню",
    );
  });
