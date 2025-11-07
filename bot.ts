/// <reference lib="deno.unstable" />

import { Bot } from "@gramio/core";
import { Scene, scenes } from "@gramio/scenes";

// Сцена для основного взаимодействия
const mainScene = new Scene("main")
  .step("message", (context) => {
    if (context.scene.step.firstTime) {
      return context.send(
        "Добро пожаловать в MiniApp! Введите ваше имя:",
        {
          reply_markup: {
            inline_keyboard: [[{
              text: "Открыть MiniApp",
              web_app: { url: "https://konung.deno.dev" },
            }]],
          },
        },
      );
    }

    if (!context.text) return context.send("Пожалуйста, введите текст");

    return context.scene.update({
      userName: context.text,
    });
  })
  .step("message", (context) => {
    const age = parseInt(context.text || "0");
    if (isNaN(age) || age < 1 || age > 100) {
      return context.send("Пожалуйста, введите корректный возраст (1-100 лет)");
    }

    return context.scene.update({
      userAge: age,
    });
  })
  .step("message", async (context) => {
    await context.send(
      `Приятно познакомиться! Вас зовут ${context.scene.state.userName}, вам ${context.scene.state.userAge} лет.`,
    );

    // Сохраняем данные в Deno KV
    if (context.from) {
      const kv = await Deno.openKv();
      await kv.set(["users", context.from.id], {
        name: context.scene.state.userName,
        age: context.scene.state.userAge,
        registered: new Date().toISOString(),
      });
    }

    return context.scene.exit();
  });

// Инициализация бота
export const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN")!)
  .extend(scenes([mainScene]))
  .command("start", (context) => context.scene.enter(mainScene))
  .command("menu", (context) => {
    return context.send("Меню недоступно в текущей версии бота.");
  });
