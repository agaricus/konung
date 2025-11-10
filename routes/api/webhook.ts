import { define } from "@/utils/index.ts";
import { bot as _bot } from "@/bot.ts";

// Обработчик вебхука для Telegram
export const handler = define.handlers({
  async POST(ctx) {
    const secret = ctx.req.headers.get("X-Telegram-Bot-Api-Secret-Token");

    if (secret !== Deno.env.get("WEBHOOK_SECRET_TOKEN")) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const update = await ctx.req.json();
      // TODO: Implement proper update handling for GramIO bot
      console.log("Received update:", update);
      return new Response("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Error", { status: 500 });
    }
  },
});
