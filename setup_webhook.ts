// В отдельном скрипте для настройки вебхука
import { bot as _bot } from "@/bot.ts";

if (import.meta.main) {
  const WEBHOOK_URL = "https://konung.deno.dev/api/webhook";
  const SECRET_TOKEN = Deno.env.get("WEBHOOK_SECRET_TOKEN");

  // TODO: Implement proper webhook setup for GramIO bot
  console.log("Webhook setup not yet implemented for GramIO");
  console.log(`Webhook URL would be: ${WEBHOOK_URL}`);
  console.log(`Secret token: ${SECRET_TOKEN ? "configured" : "missing"}`);
}
