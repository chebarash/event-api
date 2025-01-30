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
const clubs_1 = __importDefault(require("../models/clubs"));
const events_1 = __importDefault(require("../models/events"));
const users_1 = __importDefault(require("../models/users"));
const error_1 = __importDefault(require("./error"));
const filters_1 = require("telegraf/filters");
const { ADMIN_ID } = process.env;
const adminId = parseInt(ADMIN_ID);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tempMethod = (bot) => {
    bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (ctx.user.clubs.length)
                yield next();
        }
        catch (e) {
            yield (0, error_1.default)(ctx, e);
        }
    }));
    bot.action(/^notify\/\//g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        const event = yield events_1.default.findOne({ _id }).populate(`author`);
        if (!event)
            return;
        const members = yield users_1.default.find({ member: event.author._id }).exec();
        let sent = 0;
        for (const { id } of members) {
            try {
                yield ctx.telegram.sendPhoto(id, event.picture, {
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
                    yield ctx.editMessageReplyMarkup({
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
            }
            catch (e) {
                console.log(e);
            }
        }
        yield ctx.editMessageReplyMarkup({
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
    }));
    bot.action(/^delete/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        yield events_1.default.deleteOne({ _id });
        yield ctx.deleteMessage();
    }));
    const replyId = (ctx, fileId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const { caption, caption_entities } = ctx.update.message;
        if (caption) {
            const html = toHtml(caption_entities || [], caption);
            return yield ctx.reply("```" + fileId + "```\n\n```HTML\n" + html + "```", {
                reply_parameters: { message_id: ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.message_id) || 0 },
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Create Event`,
                                web_app: {
                                    url: `https://event.chebarash.uz/events/create?${/^AgACAgIAAxkBA[A-Za-z0-9_\-]{53,90}$/.test(fileId)
                                        ? `picture`
                                        : `content`}=${encodeURIComponent(fileId)}&description=${encodeURIComponent(html)}`,
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
        }
        return yield ctx.reply(`File ID: <pre>${fileId}</pre>`, {
            reply_parameters: { message_id: ((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.message_id) || 0 },
            parse_mode: `HTML`,
        });
    });
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
    const toHtml = (entities, text) => {
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
        return html;
    };
    bot.on((0, filters_1.message)(`text`), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { text, entities, message_id } = ctx.message;
        if (!entities)
            return text;
        const html = toHtml(entities, text);
        return yield ctx.reply("```HTML\n" + html + "```", {
            parse_mode: "MarkdownV2",
            reply_parameters: { message_id },
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `Create Event`,
                            web_app: {
                                url: `https://event.chebarash.uz/events/create?description=${encodeURIComponent(html)}`,
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
    }));
    bot.action(/^to\/\//g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        const event = yield events_1.default.find({ author: _id });
        yield ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: `Send to all members`, callback_data: `toAll//${_id}` }],
                ...event.map(({ _id, title }) => [
                    { text: `Send to ${title}`, callback_data: `toEvent//${_id}` },
                ]),
            ],
        });
    }));
    bot.action(/^toAll\/\//g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        const club = yield clubs_1.default.findOne({ _id });
        if (!club)
            return;
        const users = yield users_1.default.find({ member: _id });
        if (!ctx.chat ||
            !ctx.callbackQuery.message ||
            !ctx.callbackQuery.message.reply_to_message)
            return;
        let sent = 0;
        for (const { id } of users) {
            try {
                yield ctx.telegram.copyMessage(id, ctx.chat.id, ctx.callbackQuery.message.reply_to_message.message_id, {
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
                });
                sent++;
                if (sent % 4 == 0)
                    yield ctx.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                {
                                    text: `Sent to ${sent}/${users.length} members...`,
                                    callback_data: `empty`,
                                },
                            ],
                        ],
                    });
                yield sleep(30);
            }
            catch (e) {
                console.log(e);
            }
        }
        yield ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [
                    {
                        text: `Sent to ${sent}/${users.length} members ${club.name}`,
                        callback_data: `empty`,
                    },
                ],
            ],
        });
        yield ctx.telegram.copyMessage(adminId, ctx.chat.id, ctx.callbackQuery.message.reply_to_message.message_id, {
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
        });
        yield ctx.telegram.sendMessage(adminId, `Sent to ${sent}/${users.length} members ${club.name}\n${ctx.user.name} - ${ctx.user.email}`);
    }));
    bot.action(/^toEvent\/\//g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        const event = yield events_1.default.findOne({ _id }).populate(`registered`);
        if (!event ||
            !ctx.chat ||
            !ctx.callbackQuery.message ||
            !ctx.callbackQuery.message.reply_to_message)
            return;
        let sent = 0;
        for (const { id } of event.registered) {
            try {
                yield ctx.telegram.copyMessage(id, ctx.chat.id, ctx.callbackQuery.message.reply_to_message.message_id, {
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
                });
                sent++;
                if (sent % 4 == 0)
                    yield ctx.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                {
                                    text: `Sent to ${sent}/${event.registered.length}...`,
                                    callback_data: `empty`,
                                },
                            ],
                        ],
                    });
                yield sleep(30);
            }
            catch (e) {
                console.log(e);
            }
        }
        yield ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [
                    {
                        text: `Sent to ${sent}/${event.registered.length} registered ${event.title}`,
                        callback_data: `empty`,
                    },
                ],
            ],
        });
        yield ctx.telegram.copyMessage(adminId, ctx.chat.id, ctx.callbackQuery.message.reply_to_message.message_id, {
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
        });
        yield ctx.telegram.sendMessage(adminId, `Sent to ${sent}/${event.registered.length} registered ${event.title}\n${ctx.user.name} - ${ctx.user.email}`);
    }));
};
exports.tempMethod = tempMethod;
