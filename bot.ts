import { Bot } from "@gramio/core";
import { scenes } from "@gramio/scenes";
import {
  authScene,
  logoutScene,
  mainScene,
  profileScene,
} from "@/bot/scenes.ts";

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
