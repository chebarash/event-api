import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import {
  InlineQueryResult,
  Update,
} from "telegraf/typings/core/types/typegram";
import { getEvents } from "../models/events";

const loadTemplate = (
  template: string = `<b>{{title}}</b>\n\n{{description}}\n\n<b>Venue:</b> {{venue}}\n<b>Date:</b> {{date}}\n<b>Time:</b> {{time}}`,
  variables: { [name: string]: any }
): string => {
  Object.entries(variables).forEach(
    ([name, value]) =>
      (template = template.replace(new RegExp(`{{${name}}}`, "g"), value))
  );
  return template;
};

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
        template,
        content,
        button,
      }): InlineQueryResult => {
        const d = new Date(date);
        const hours = duration / (1000 * 60 * 60);
        return {
          ...(content && content.type == `video`
            ? {
                type: `video`,
                video_file_id: content.fileId,
                title,
              }
            : {
                type: `photo`,
                photo_file_id: content ? content.fileId : picture,
                description: title,
              }),
          thumbnail_url: picture,
          id: `${_id}`,
          caption: loadTemplate(template, {
            title,
            description,
            date:
              d.toLocaleDateString(`en`, {
                month: `long`,
                timeZone: `Asia/Tashkent`,
              }) +
              ` ` +
              d.toLocaleDateString(`en`, {
                day: `numeric`,
                timeZone: `Asia/Tashkent`,
              }),
            time: d.toLocaleString(`en`, {
              timeStyle: `short`,
              timeZone: `Asia/Tashkent`,
            }),
            venue,
            duration: `${hours} ${hours == 1 ? `hour` : `hours`}`,
            author: authors[0].given_name
              .toLowerCase()
              .replace(/\b(\w)/g, (x) => x.toUpperCase()),
          }),
          parse_mode: `HTML`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: button || `Open in Event`,
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
