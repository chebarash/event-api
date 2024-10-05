import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import {
  InlineQueryResult,
  Update,
} from "telegraf/typings/core/types/typegram";
import { getEvents } from "../models/events";

function truncateHtml(html: string, length: number) {
  const pattern = /<([a-zA-Z0-9\-]+)(\s*[^>]*)?>([\s\S]*?)<\/\1>/g;

  function truncateNode(node: string) {
    let result = "";
    if (length <= 0) return "";
    const list = node.split(pattern);
    result += list[0];
    length -= list[0].length;
    for (let i = 1; i < list.length && length > 0; i += 4) {
      const tag = list[i],
        args = list[i + 1],
        child = list[i + 2];

      result += `<${[tag, args].join(` `)}>${truncateNode(child)}</${tag}>`;

      if (length > 0) {
        result += list[i + 3];
        length -= list[i + 3].length;
      }
    }
    return result;
  }

  return { text: truncateNode(html), length };
}

const loadTemplate = (
  template: string = `<b>{{title}}</b>\n\n{{description}}\n\n<b>Venue:</b> {{venue}}\n<b>Date:</b> {{date}}\n<b>Time:</b> {{time}}`,
  variables: { [name: string]: any }
): string => {
  Object.entries(variables).forEach(([name, value]) => {
    if (name != `description`)
      template = template.replace(new RegExp(`{{${name}}}`, `g`), value);
  });
  const { text, length } = truncateHtml(variables.description, 800);
  template = template.replace(
    /{{description}}/g,
    `${text}${length > 0 ? `` : `...\n<b><u>Read More In Event</u></b>`}`
  );
  return template;
};

const inline = async (
  ctx: NarrowedContext<MyContext, Update.InlineQueryUpdate>
) => {
  const offset = parseInt(ctx.inlineQuery.offset) || 0;
  const data = await getEvents({
    title: { $regex: ctx.inlineQuery.query, $options: `i` },
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
        author,
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
            author: author.name,
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
