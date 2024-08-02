import { MessageEntity } from "telegraf/typings/core/types/typegram";
import Events from "../models/events";
import { ContentType, EventType, MyContext, UserType } from "../types/types";
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

  const splitter = `⁠`;
  const ent = [`json`, `typescript`];

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
    const events = await Events.find({ authors: ctx.user._id }).populate(
      `authors`
    );
    ctx.editMessageReplyMarkup({
      inline_keyboard: events.map(({ title, _id }) => {
        return [
          {
            text: title,
            url: `https://t.me/pueventbot/event?startapp=${_id}`,
          },
          { text: `delete`, callback_data: `delete//${_id}` },
        ];
      }),
    });
  });

  bot.command(`newevent`, async (ctx) => {
    const { text } = ctx.message;
    const [_, ...values] = text.split(` `);
    if (values[0]) {
      const data = JSON.parse(values.join(` `));
      if (isEventType(data))
        return await ctx.reply(
          `<pre><code class="language-json">${JSON.stringify(
            data,
            null,
            2
          )}</code></pre>\n${splitter}\n<pre><code class="typescript">title: string;\npicture: string; // FileId\ndescription: string; // HTML\nauthors: UserType[];\ndate: Date; // ${new Date().toISOString()}\nvenue: string;\nduration: number; // in milliseconds\ncontent?: { type: "video" | "photo"; fileId: string };\ntemplate?: string; // HTML, {{variableName}}\nbutton?: string;</code></pre>`,
          {
            parse_mode: `HTML`,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `Preview`, callback_data: `preview` },
                  { text: `Save`, callback_data: `save` },
                ],
              ],
            },
          }
        );
    }
    await ctx.reply(
      `<pre><code class="language-json">${JSON.stringify(
        {
          authors: [ctx.user],
        },
        null,
        2
      )}</code></pre>\n${splitter}\n<pre><code class="typescript">title: string;\npicture: string; // FileId\ndescription: string; // HTML\nauthors: UserType[];\ndate: Date; // ${new Date().toISOString()}\nvenue: string;\nduration: number; // in milliseconds\ncontent?: { type: "video" | "photo"; fileId: string };\ntemplate?: string; // HTML, {{variableName}}\nbutton?: string;</code></pre>`,
      {
        parse_mode: `HTML`,
      }
    );
  });

  const isContentType = (obj: any): obj is ContentType =>
    obj &&
    (obj.type === "video" || obj.type === "photo") &&
    typeof obj.fileId === "string";

  const isUserType = (obj: any): obj is UserType =>
    obj &&
    typeof obj.given_name === "string" &&
    typeof obj.family_name === "string" &&
    typeof obj.picture === "string" &&
    typeof obj.email === "string" &&
    typeof obj.id === "number" &&
    typeof obj.organizer === "boolean";

  const isEventType = (obj: any): obj is EventType =>
    obj &&
    typeof obj.title === "string" &&
    typeof obj.picture === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.authors) &&
    obj.authors.every(isUserType) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(obj.date) &&
    typeof obj.venue === "string" &&
    typeof obj.duration === "number" &&
    (obj.content === undefined || isContentType(obj.content)) &&
    (obj.template === undefined || typeof obj.template === "string") &&
    (obj.button === undefined || typeof obj.button === "string");

  const loadTemplate = (
    template: string = `<b>{{title}}</b>\n\n{{description}}\n\n<b>Venue:</b> {{venue}}\n<b>Date:</b> {{date}}\n<b>Time:</b> {{time}}`,
    variables: { [name: string]: any }
  ): string => {
    Object.entries(variables).forEach(
      ([name, value]) =>
        (template = template.replace(new RegExp(`{{${name}}}`, `g`), value))
    );
    return template;
  };

  bot.action(`save`, async (ctx) => {
    const { message } = ctx.callbackQuery;
    const { text } = message as { text?: string };
    if (!message || !text) return;
    const [json] = text.split(`\n${splitter}\n`);
    const data: EventType = JSON.parse(json);
    if (!isEventType(data)) return;
    const {
      _id,
      template,
      title,
      description,
      date,
      venue,
      authors,
      duration,
      content,
      picture,
      button,
    } = await (await new Events(data).save()).populate(`authors`);
    const d = new Date(date);
    const hours = duration / (1000 * 60 * 60);
    ctx.editMessageReplyMarkup({ inline_keyboard: [[]] });
    ctx[content?.type == `video` ? `replyWithVideo` : `replyWithPhoto`](
      content?.fileId || picture,
      {
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
      }
    );
  });

  bot.action(`preview`, async (ctx) => {
    const { message } = ctx.callbackQuery;
    const { text } = message as { text?: string };
    if (!message || !text) return;
    const [json] = text.split(`\n${splitter}\n`);
    const data: EventType = JSON.parse(json);
    if (!isEventType(data)) return;
    const {
      template,
      title,
      description,
      date,
      venue,
      authors,
      duration,
      content,
      picture,
      button,
    } = data;
    const d = new Date(date);
    const hours = duration / (1000 * 60 * 60);
    ctx[content?.type == `video` ? `replyWithVideo` : `replyWithPhoto`](
      content?.fileId || picture,
      {
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
                url: `https://t.me/pueventbot/event`,
              },
            ],
          ],
        },
      }
    );
  });

  type ValidType = false | string | number | ContentType;

  const list: Array<{
    name: string;
    validate?: (text: string) => Promise<ValidType>;
  }> = [
    { name: `title` },
    {
      name: `picture`,
      validate: async (text) => {
        try {
          await bot.telegram.getFile(text);
          return text;
        } catch (e) {
          return false;
        }
      },
    },
    { name: `description` },
    {
      name: `date`,
      validate: async (text) =>
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(text)
          ? text
          : false,
    },
    { name: `venue` },
    {
      name: `duration`,
      validate: async (text) => {
        if (/^-?\d+$/.test(text)) {
          const number = parseInt(text);
          if (Number.isInteger(number)) return number;
        }
        return false;
      },
    },
    {
      name: `content`,
      validate: async (text) => {
        if (
          !/\{\s*"type"\s*:\s*"(video|photo)"\s*,\s*"fileId"\s*:\s*"[A-Za-z0-9_-]+"\s*\}/.test(
            text
          )
        )
          return false;
        try {
          const data: ContentType = JSON.parse(text);
          await bot.telegram.getFile(data.fileId);
          return data;
        } catch (e) {
          return false;
        }
      },
    },
    { name: `template` },
    { name: `button` },
  ];

  for (const { name, validate } of list) {
    bot.command(`set${name}`, async (ctx) => {
      const {
        message: { reply_to_message, text },
      } = ctx as {
        message: {
          reply_to_message?: {
            text: string;
            entities?: Array<MessageEntity>;
            message_id: number;
          };
          text: string;
        };
      };
      const [_, ...values] = text.split(` `);
      if (!values[0])
        return await ctx.reply(
          `Required in format: <pre>/set${name} value</pre>`,
          { parse_mode: `HTML` }
        );
      if (
        !reply_to_message ||
        !reply_to_message.entities ||
        reply_to_message.entities.length != 2 ||
        reply_to_message.entities.some(
          (entity, i) => entity.type != `pre` || entity.language != ent[i]
        )
      )
        return await ctx.reply(`Reply to event message`);
      const [json, extra] = reply_to_message.text.split(`\n${splitter}\n`);
      const data = JSON.parse(json);
      let value: ValidType = values.join(` `);
      if (validate) value = await validate(value);
      if (!value) return await ctx.reply(`Wrong data`);
      data[name] = value;
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        reply_to_message.message_id,
        undefined,
        `<pre><code class="language-json">${JSON.stringify(
          data,
          null,
          2
        )}</code></pre>\n${splitter}\n<pre><code class="typescript">${extra}</code></pre>`,
        {
          parse_mode: `HTML`,
          ...(isEventType(data)
            ? {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: `Preview`, callback_data: `preview` },
                      { text: `Save`, callback_data: `save` },
                    ],
                  ],
                },
              }
            : {}),
        }
      );
    });
  }

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
