import Events from "../models/events";
import { MyContext } from "../types/types";
import error from "./error";
import { Context, NarrowedContext, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {
  Message,
  MessageEntity,
  Update,
} from "telegraf/typings/core/types/typegram";

export const tempMethod = (bot: Telegraf<MyContext>) => {
  bot.use(async (ctx, next) => {
    try {
      if (ctx.user.clubs.length) await next();
    } catch (e) {
      await error(ctx, e);
    }
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
                      /^AgACAgIAAxkBA[A-Za-z0-9_\-]{53,70}$/.test(fileId)
                        ? `picture`
                        : `content`
                    }=${encodeURIComponent(
                      fileId
                    )}&description=${encodeURIComponent(html)}`,
                  },
                },
              ],
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
    const { text, entities } = ctx.message;

    if (!entities) return text;

    const html = toHtml(entities, text);

    return await ctx.reply("```HTML\n" + html + "```", {
      parse_mode: "MarkdownV2",
    });
  });
};
