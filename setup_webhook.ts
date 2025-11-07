// В отдельном скрипте для настройки вебхука
import { bot } from "@/bot.ts";

if (import.meta.main) {
  const WEBHOOK_URL = "https://konung.deno.dev/api/webhook";
  const SECRET_TOKEN = Deno.env.get("WEBHOOK_SECRET_TOKEN");

  await bot.setWebhook(WEBHOOK_URL, {
    secret_token: SECRET_TOKEN,
  });

  console.log("Webhook установлен!");
}
