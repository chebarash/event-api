import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import {
  InlineQueryResult,
  Update,
} from "telegraf/typings/core/types/typegram";
import { getEvents } from "../models/events";

const inline = async (
  ctx: NarrowedContext<MyContext, Update.InlineQueryUpdate>
) => {
  const offset = parseInt(ctx.inlineQuery.offset) || 0;
  const data = await getEvents({
    title: { $regex: ctx.inlineQuery.query, $options: "i" },
  });

  let results = data
    .slice(offset, offset + 10)
    .map(
      ({
        _id,
        title,
        picture,
        description,
        date,
        venue,
        duration,
        authors,
      }): InlineQueryResult => {
        const d = new Date(date);
        return {
          type: `photo`,
          id: `${_id}`,
          photo_url: picture,
          thumbnail_url: picture,
          description: title,
          caption: `<b>${title}⚡️</b>\n\n${description}\n\n<b>📍 Venue:</b> ${venue}\n<b>🗓 Date:</b> ${
            d.toLocaleDateString(`en`, {
              month: `long`,
              timeZone: `Asia/Tashkent`,
            }) +
            ` ` +
            d.toLocaleDateString(`en`, {
              day: `numeric`,
              timeZone: `Asia/Tashkent`,
            })
          }\n<b>⏱ Time:</b> ${d.toLocaleString(`en`, {
            timeStyle: `short`,
            timeZone: `Asia/Tashkent`,
          })}`,
          parse_mode: `HTML`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Open in Event`,
                  url: `https://t.me/pueventbot/event?startapp=${_id}`,
                },
              ],
            ],
          },
        };
      }
    );

  return await ctx.answerInlineQuery(results, {
    is_personal: true,
    next_offset: `${offset + results.length}`,
    cache_time: 10,
  });
};

export = inline;
