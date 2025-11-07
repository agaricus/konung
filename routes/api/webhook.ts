import { define } from "@/utils.ts";
import { bot } from "@/bot.ts";

// Обработчик вебхука для Telegram
export const handler = define.handlers({
  async POST(ctx) {
    const secret = ctx.req.headers.get("X-Telegram-Bot-Api-Secret-Token");

    if (secret === Deno.env.get("WEBHOOK_SECRET_TOKEN")) {
      try {
        const update = await ctx.req.json();
        await bot.handleUpdate(update);
        return new Response("OK");
      } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Error", { status: 500 });
      }
    }
  },
});
