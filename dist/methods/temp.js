"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempMethod = void 0;
const events_1 = __importDefault(require("../models/events"));
const error_1 = __importDefault(require("./error"));
const filters_1 = require("telegraf/filters");
const tempMethod = (bot) => {
    bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (ctx.user.organizer || ctx.user.clubs.length)
                yield next();
        }
        catch (e) {
            yield (0, error_1.default)(ctx, e);
        }
    }));
    bot.action(/^delete/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        yield events_1.default.deleteOne({ _id });
        yield ctx.deleteMessage();
    }));
    const replyId = (ctx, fileId) => {
        var _a;
        return ctx.reply(`File ID: <pre>${fileId}</pre>`, {
            reply_parameters: { message_id: ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.message_id) || 0 },
            parse_mode: `HTML`,
        });
    };
    bot.on((0, filters_1.message)(`photo`), (ctx) => replyId(ctx, ctx.message.photo[ctx.message.photo.length - 1].file_id));
    bot.on((0, filters_1.message)(`video`), (ctx) => replyId(ctx, ctx.message.video.file_id));
    const getTag = (entity, text) => {
        const entityText = text.slice(entity.offset, entity.offset + entity.length);
        switch (entity.type) {
            case "bold":
                return `<b>`;
            case "spoiler":
                return `<tg-spoiler>`;
            case "text_link":
                return `<a href="${entity.url}">`;
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
    bot.on((0, filters_1.message)(`text`), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { text, entities } = ctx.message;
        if (!entities) {
            return text;
        }
        let tags = [];
        entities.forEach((entity) => {
            const startTag = getTag(entity, text);
            let searchTag = tags.filter((tag) => tag.index === entity.offset);
            if (searchTag.length > 0)
                searchTag[0].tag += startTag;
            else
                tags.push({
                    index: entity.offset,
                    tag: startTag,
                });
            const closeTag = startTag.indexOf("<a ") === 0
                ? "</a>"
                : startTag.indexOf("<blockquote expandable") === 0
                    ? "</blockquote>"
                    : "</" + startTag.slice(1);
            searchTag = tags.filter((tag) => tag.index === entity.offset + entity.length);
            if (searchTag.length > 0)
                searchTag[0].tag = closeTag + searchTag[0].tag;
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
            if (tag.length > 0)
                html += tag[0].tag;
            html += text[i];
        }
        if (tags.length > 0)
            html += tags[0].tag;
        return yield ctx.reply("```HTML\n" + html + "```", {
            parse_mode: "MarkdownV2",
        });
    }));
};
exports.tempMethod = tempMethod;
