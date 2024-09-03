import Events from "../models/events";
import { MyContext } from "../types/types";
import error from "./error";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

export const tempMethod = (bot: Telegraf<MyContext>) => {
  bot.use(async (ctx, next) => {
    try {
      if (ctx.user.organizer) await next();
    } catch (e) {
      await error(ctx, e);
    }
  });

  bot.command(`myevents`, async (ctx) => {
    const events = await Events.find({ authors: ctx.user._id }).populate(
      `authors`
    );
    ctx.reply(`Events`, {
      reply_markup: {
        inline_keyboard: events.map(({ title, _id }) => {
          return [
            {
              text: title,
              url: `https://t.me/pueventbot/event?startapp=${_id}`,
            },
            { text: `delete`, callback_data: `delete//${_id}` },
          ];
        }),
      },
    });
  });

  bot.action(/^delete/g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    await Events.deleteOne({ _id });
    await ctx.deleteMessage();
  });

  const replyId = (ctx: Context, fileId: string) =>
    ctx.reply(`File ID: <pre>${fileId}</pre>`, {
      reply_parameters: { message_id: ctx.message?.message_id || 0 },
      parse_mode: `HTML`,
    });

  bot.on(message(`photo`), (ctx) =>
    replyId(ctx, ctx.message.photo[ctx.message.photo.length - 1].file_id)
  );
  bot.on(message(`video`), (ctx) => replyId(ctx, ctx.message.video.file_id));
};
