import Clubs from "../models/clubs";
import Events from "../models/events";
import Users from "../models/users";
import { MyContext } from "../types/types";
import error from "./error";
import { NarrowedContext, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {
  Message,
  MessageEntity,
  Update,
} from "telegraf/typings/core/types/typegram";

const { ADMIN_ID } = process.env;

const adminId = parseInt(ADMIN_ID);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tempMethod = (bot: Telegraf<MyContext>) => {
  bot.use(async (ctx, next) => {
    try {
      if (ctx.user.clubs.length) await next();
    } catch (e) {
      await error(ctx, e);
    }
  });

  bot.action(/^notify\/\//g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    const event = await Events.findOne({ _id }).populate(`author`);
    if (!event) return;
    const members = await Users.find({ member: event.author._id }).exec();
    let sent = 0;
    for (const { id } of members) {
      try {
        await ctx.telegram.sendPhoto(id, event.picture, {
          caption: `<b>New event by ${event.author.name}:</b> ${event.title}`,
          parse_mode: `HTML`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Open Event`,
                  web_app: {
                    url: `https://event.chebarash.uz/events/${event._id}`,
                  },
                },
              ],
              [
                {
                  text: event.author.name,
                  web_app: {
                    url: `https://event.chebarash.uz/clubs/${event.author._id}`,
                  },
                },
              ],
            ],
          },
        });
        sent++;
        if (sent % 4 == 0)
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [
                {
                  text: event.title,
                  web_app: {
                    url: `https://event.chebarash.uz/events/${event._id}`,
                  },
                },
              ],
              [
                {
                  text: `Sent to ${sent}/${members.length} members...`,
                  callback_data: `empty`,
                },
              ],
            ],
          });
      } catch (e) {
        console.log(e);
      }
    }
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: event.title,
            web_app: {
              url: `https://event.chebarash.uz/events/${event._id}`,
            },
          },
        ],
        [
          {
            text: `Sent to ${sent}/${members.length}`,
            callback_data: `empty`,
          },
        ],
      ],
    });
  });

  bot.action(/^delete/g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    await Events.deleteOne({ _id });
    await ctx.deleteMessage();
  });

  const replyId = async (
    ctx: NarrowedContext<
      MyContext,
      Update.MessageUpdate<
        (Record<`video`, {}> & Message.VideoMessage) | Message.PhotoMessage
      >
    >,
    fileId: string
  ) => {
    const { caption, caption_entities } = ctx.update.message;
    if (caption) {
      const html = toHtml(caption_entities || [], caption);
      return await ctx.reply(
        "```" + fileId + "```\n\n```HTML\n" + html + "```",
        {
          reply_parameters: { message_id: ctx.message?.message_id || 0 },
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Create Event`,
                  web_app: {
                    url: `https://event.chebarash.uz/events/create?${
                      /^AgACAgIAAxkBA[A-Za-z0-9_\-]{53,90}$/.test(fileId)
                        ? `picture`
                        : `content`
                    }=${encodeURIComponent(
                      fileId
                    )}&description=${encodeURIComponent(html)}`,
                  },
                },
              ],
              ...ctx.user.clubs.map(({ name, _id }) => [
                {
                  text: name,
                  callback_data: `to//${_id}`,
                },
              ]),
            ],
          },
        }
      );
    }
    return await ctx.reply(`File ID: <pre>${fileId}</pre>`, {
      reply_parameters: { message_id: ctx.message?.message_id || 0 },
      parse_mode: `HTML`,
    });
  };

  bot.on(message(`photo`), (ctx) =>
    replyId(ctx, ctx.message.photo[ctx.message.photo.length - 1].file_id)
  );
  bot.on(message(`video`), (ctx) => replyId(ctx, ctx.message.video.file_id));

  const getTag = (entity: MessageEntity, text: string) => {
    const entityText = text.slice(entity.offset, entity.offset + entity.length);

    switch (
      entity.type as
        | "bold"
        | "italic"
        | "underline"
        | "strikethrough"
        | "spoiler"
        | "text_link"
        | "code"
        | "pre"
        | "blockquote"
        | "expandable_blockquote"
        | "url"
        | "mention"
    ) {
      case "bold":
        return `<b>`;
      case "spoiler":
        return `<tg-spoiler>`;
      case "text_link":
        return `<a href="${(entity as { url: string }).url}">`;
      case "url":
        return `<a href="${entityText}">`;
      case "italic":
        return `<i>`;
      case "code":
        return `<code>`;
      case "strikethrough":
        return `<s>`;
      case "underline":
        return `<u>`;
      case "blockquote":
        return `<blockquote>`;
      case "expandable_blockquote":
        return `<blockquote expandable>`;
      case "pre":
        return `<pre>`;
      case "mention":
        return `<a href="https://t.me/${entityText.replace("@", "")}">`;
    }
  };

  const toHtml = (entities: Array<MessageEntity>, text: string) => {
    let tags: Array<{ index: number; tag: string }> = [];

    entities.forEach((entity) => {
      const startTag = getTag(entity, text);
      let searchTag = tags.filter((tag) => tag.index === entity.offset);
      if (searchTag.length > 0) searchTag[0].tag += startTag;
      else
        tags.push({
          index: entity.offset,
          tag: startTag,
        });

      const closeTag =
        startTag.indexOf("<a ") === 0
          ? "</a>"
          : startTag.indexOf("<blockquote expandable") === 0
          ? "</blockquote>"
          : "</" + startTag.slice(1);
      searchTag = tags.filter(
        (tag) => tag.index === entity.offset + entity.length
      );
      if (searchTag.length > 0) searchTag[0].tag = closeTag + searchTag[0].tag;
      else
        tags.push({
          index: entity.offset + entity.length,
          tag: closeTag,
        });
    });
    let html = "";
    for (let i = 0; i < text.length; i++) {
      const tag = tags.filter((tag) => tag.index === i);
      tags = tags.filter((tag) => tag.index !== i);
      if (tag.length > 0) html += tag[0].tag;
      html += text[i];
    }
    if (tags.length > 0) html += tags[0].tag;
    return html;
  };

  bot.on(message(`text`), async (ctx) => {
    const { text, entities, message_id } = ctx.message;

    if (!entities) return text;

    const html = toHtml(entities, text);

    return await ctx.reply("```HTML\n" + html + "```", {
      parse_mode: "MarkdownV2",
      reply_parameters: { message_id },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Create Event`,
              web_app: {
                url: `https://event.chebarash.uz/events/create?description=${encodeURIComponent(
                  html
                )}`,
              },
            },
          ],
          ...ctx.user.clubs.map(({ name, _id }) => [
            {
              text: name,
              callback_data: `to//${_id}`,
            },
          ]),
        ],
      },
    });
  });

  bot.action(/^to\/\//g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    const event = await Events.find({ author: _id });
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [{ text: `Send to all members`, callback_data: `toAll//${_id}` }],
        ...event.map(({ _id, title }) => [
          { text: `Send to ${title}`, callback_data: `toEvent//${_id}` },
        ]),
      ],
    });
  });

  bot.action(/^toAll\/\//g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    const club = await Clubs.findOne({ _id });
    if (!club) return;
    const users = await Users.find({ member: _id });
    if (
      !ctx.chat ||
      !ctx.callbackQuery.message ||
      !(ctx.callbackQuery.message as any).reply_to_message
    )
      return;
    let sent = 0;
    for (const { id } of users) {
      try {
        await ctx.telegram.copyMessage(
          id,
          ctx.chat.id,
          (ctx.callbackQuery.message as any).reply_to_message.message_id,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: club.name,
                    web_app: {
                      url: `https://event.chebarash.uz/clubs/${_id}`,
                    },
                  },
                ],
              ],
            },
          }
        );
        sent++;
        if (sent % 4 == 0)
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [
                {
                  text: `Sent to ${sent}/${users.length} members...`,
                  callback_data: `empty`,
                },
              ],
            ],
          });
        await sleep(30);
      } catch (e) {
        console.log(e);
      }
    }
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: `Sent to ${sent}/${users.length} members ${club.name}`,
            callback_data: `empty`,
          },
        ],
      ],
    });
    await ctx.telegram.copyMessage(
      adminId,
      ctx.chat.id,
      (ctx.callbackQuery.message as any).reply_to_message.message_id,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: club.name,
                web_app: {
                  url: `https://event.chebarash.uz/clubs/${_id}`,
                },
              },
            ],
          ],
        },
      }
    );
    await ctx.telegram.sendMessage(
      adminId,
      `Sent to ${sent}/${users.length} members ${club.name}\n${ctx.user.name} - ${ctx.user.email}`
    );
  });

  bot.action(/^toEvent\/\//g, async (ctx) => {
    const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
    const event = await Events.findOne({ _id }).populate(`registered`);
    if (
      !event ||
      !ctx.chat ||
      !ctx.callbackQuery.message ||
      !(ctx.callbackQuery.message as any).reply_to_message
    )
      return;
    let sent = 0;
    for (const { id } of event.registered) {
      try {
        await ctx.telegram.copyMessage(
          id,
          ctx.chat.id,
          (ctx.callbackQuery.message as any).reply_to_message.message_id,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: event.title,
                    web_app: {
                      url: `https://event.chebarash.uz/events/${_id}`,
                    },
                  },
                ],
              ],
            },
          }
        );
        sent++;
        if (sent % 4 == 0)
          await ctx.editMessageReplyMarkup({
            inline_keyboard: [
              [
                {
                  text: `Sent to ${sent}/${event.registered.length}...`,
                  callback_data: `empty`,
                },
              ],
            ],
          });
        await sleep(30);
      } catch (e) {
        console.log(e);
      }
    }
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: `Sent to ${sent}/${event.registered.length} registered ${event.title}`,
            callback_data: `empty`,
          },
        ],
      ],
    });
    await ctx.telegram.copyMessage(
      adminId,
      ctx.chat.id,
      (ctx.callbackQuery.message as any).reply_to_message.message_id,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: event.title,
                web_app: {
                  url: `https://event.chebarash.uz/events/${_id}`,
                },
              },
            ],
          ],
        },
      }
    );
    await ctx.telegram.sendMessage(
      adminId,
      `Sent to ${sent}/${event.registered.length} registered ${event.title}\n${ctx.user.name} - ${ctx.user.email}`
    );
  });
};
