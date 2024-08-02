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
            if (ctx.user.organizer)
                yield next();
        }
        catch (e) {
            yield (0, error_1.default)(ctx, e);
        }
    }));
    const splitter = `⁠`;
    const ent = [`json`, `typescript`];
    bot.command(`myevents`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const events = yield events_1.default.find({ authors: ctx.user._id }).populate(`authors`);
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
    }));
    bot.action(/^delete/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const _id = ctx.callbackQuery.data.split(`//`)[1];
        yield events_1.default.deleteOne({ _id });
        const events = yield events_1.default.find({ authors: ctx.user._id }).populate(`authors`);
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
    }));
    bot.command(`newevent`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { text } = ctx.message;
        const [_, ...values] = text.split(` `);
        if (values[0]) {
            const data = JSON.parse(values.join(` `));
            if (isEventType(data))
                return yield ctx.reply(`<pre><code class="language-json">${JSON.stringify(data, null, 2)}</code></pre>\n${splitter}\n<pre><code class="typescript">title: string;\npicture: string; // FileId\ndescription: string; // HTML\nauthors: UserType[];\ndate: Date; // ${new Date().toISOString()}\nvenue: string;\nduration: number; // in milliseconds\ncontent?: { type: "video" | "photo"; fileId: string };\ntemplate?: string; // HTML, {{variableName}}\nbutton?: string;</code></pre>`, {
                    parse_mode: `HTML`,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: `Preview`, callback_data: `preview` },
                                { text: `Save`, callback_data: `save` },
                            ],
                        ],
                    },
                });
        }
        yield ctx.reply(`<pre><code class="language-json">${JSON.stringify({
            authors: [ctx.user],
        }, null, 2)}</code></pre>\n${splitter}\n<pre><code class="typescript">title: string;\npicture: string; // FileId\ndescription: string; // HTML\nauthors: UserType[];\ndate: Date; // ${new Date().toISOString()}\nvenue: string;\nduration: number; // in milliseconds\ncontent?: { type: "video" | "photo"; fileId: string };\ntemplate?: string; // HTML, {{variableName}}\nbutton?: string;</code></pre>`, {
            parse_mode: `HTML`,
        });
    }));
    const isContentType = (obj) => obj &&
        (obj.type === "video" || obj.type === "photo") &&
        typeof obj.fileId === "string";
    const isUserType = (obj) => obj &&
        typeof obj.given_name === "string" &&
        typeof obj.family_name === "string" &&
        typeof obj.picture === "string" &&
        typeof obj.email === "string" &&
        typeof obj.id === "number" &&
        typeof obj.organizer === "boolean";
    const isEventType = (obj) => obj &&
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
    const loadTemplate = (template = `<b>{{title}}</b>\n\n{{description}}\n\n<b>Venue:</b> {{venue}}\n<b>Date:</b> {{date}}\n<b>Time:</b> {{time}}`, variables) => {
        Object.entries(variables).forEach(([name, value]) => (template = template.replace(new RegExp(`{{${name}}}`, `g`), value)));
        return template;
    };
    bot.action(`save`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message } = ctx.callbackQuery;
        const { text } = message;
        if (!message || !text)
            return;
        const [json] = text.split(`\n${splitter}\n`);
        const data = JSON.parse(json);
        if (!isEventType(data))
            return;
        const { _id, template, title, description, date, venue, authors, duration, content, picture, button, } = yield (yield new events_1.default(data).save()).populate(`authors`);
        const d = new Date(date);
        const hours = duration / (1000 * 60 * 60);
        ctx.editMessageReplyMarkup({ inline_keyboard: [[]] });
        ctx[(content === null || content === void 0 ? void 0 : content.type) == `video` ? `replyWithVideo` : `replyWithPhoto`]((content === null || content === void 0 ? void 0 : content.fileId) || picture, {
            caption: loadTemplate(template, {
                title,
                description,
                date: d.toLocaleDateString(`en`, {
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
        });
    }));
    bot.action(`preview`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { message } = ctx.callbackQuery;
        const { text } = message;
        if (!message || !text)
            return;
        const [json] = text.split(`\n${splitter}\n`);
        const data = JSON.parse(json);
        if (!isEventType(data))
            return;
        const { template, title, description, date, venue, authors, duration, content, picture, button, } = data;
        const d = new Date(date);
        const hours = duration / (1000 * 60 * 60);
        ctx[(content === null || content === void 0 ? void 0 : content.type) == `video` ? `replyWithVideo` : `replyWithPhoto`]((content === null || content === void 0 ? void 0 : content.fileId) || picture, {
            caption: loadTemplate(template, {
                title,
                description,
                date: d.toLocaleDateString(`en`, {
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
        });
    }));
    const list = [
        { name: `title` },
        {
            name: `picture`,
            validate: (text) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield bot.telegram.getFile(text);
                    return text;
                }
                catch (e) {
                    return false;
                }
            }),
        },
        { name: `description` },
        {
            name: `date`,
            validate: (text) => __awaiter(void 0, void 0, void 0, function* () {
                return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(text)
                    ? text
                    : false;
            }),
        },
        { name: `venue` },
        {
            name: `duration`,
            validate: (text) => __awaiter(void 0, void 0, void 0, function* () {
                if (/^-?\d+$/.test(text)) {
                    const number = parseInt(text);
                    if (Number.isInteger(number))
                        return number;
                }
                return false;
            }),
        },
        {
            name: `content`,
            validate: (text) => __awaiter(void 0, void 0, void 0, function* () {
                if (!/\{\s*"type"\s*:\s*"(video|photo)"\s*,\s*"fileId"\s*:\s*"[A-Za-z0-9_-]+"\s*\}/.test(text))
                    return false;
                try {
                    const data = JSON.parse(text);
                    yield bot.telegram.getFile(data.fileId);
                    return data;
                }
                catch (e) {
                    return false;
                }
            }),
        },
        { name: `template` },
        { name: `button` },
    ];
    for (const { name, validate } of list) {
        bot.command(`set${name}`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const { message: { reply_to_message, text }, } = ctx;
            const [_, ...values] = text.split(` `);
            if (!values[0])
                return yield ctx.reply(`Required in format: <pre>/set${name} value</pre>`, { parse_mode: `HTML` });
            if (!reply_to_message ||
                !reply_to_message.entities ||
                reply_to_message.entities.length != 2 ||
                reply_to_message.entities.some((entity, i) => entity.type != `pre` || entity.language != ent[i]))
                return yield ctx.reply(`Reply to event message`);
            const [json, extra] = reply_to_message.text.split(`\n${splitter}\n`);
            const data = JSON.parse(json);
            let value = values.join(` `);
            if (validate)
                value = yield validate(value);
            if (!value)
                return yield ctx.reply(`Wrong data`);
            data[name] = value;
            yield ctx.telegram.editMessageText(ctx.chat.id, reply_to_message.message_id, undefined, `<pre><code class="language-json">${JSON.stringify(data, null, 2)}</code></pre>\n${splitter}\n<pre><code class="typescript">${extra}</code></pre>`, Object.assign({ parse_mode: `HTML` }, (isEventType(data)
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
                : {})));
        }));
    }
    const replyId = (ctx, fileId) => {
        var _a;
        return ctx.reply(`File ID: <pre>${fileId}</pre>`, {
            reply_parameters: { message_id: ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.message_id) || 0 },
            parse_mode: `HTML`,
        });
    };
    bot.on((0, filters_1.message)(`photo`), (ctx) => replyId(ctx, ctx.message.photo[ctx.message.photo.length - 1].file_id));
    bot.on((0, filters_1.message)(`video`), (ctx) => replyId(ctx, ctx.message.video.file_id));
};
exports.tempMethod = tempMethod;
