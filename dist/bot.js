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
const telegraf_1 = require("telegraf");
const log_1 = __importDefault(require("./methods/log"));
const login_1 = __importDefault(require("./methods/login"));
const start_1 = __importDefault(require("./methods/start"));
const error_1 = __importDefault(require("./methods/error"));
const inline_1 = __importDefault(require("./methods/inline"));
const result_1 = __importDefault(require("./methods/result"));
const users_1 = __importDefault(require("./models/users"));
const temp_1 = require("./methods/temp");
const clubs_1 = __importDefault(require("./models/clubs"));
const filters_1 = require("telegraf/filters");
const { GOOGLE_AUTH_URL, TOKEN, GROUP, ADMIN_ID } = process.env;
const bot = new telegraf_1.Telegraf(TOKEN);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.on((0, filters_1.message)(`new_chat_members`), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!GROUP.includes(`${ctx.chat.id}`))
        yield ctx.leaveChat();
}));
const accept = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.telegram.approveChatJoinRequest(GROUP, ctx.user.id);
    try {
        yield ctx.telegram.sendMessage(ADMIN_ID, `Join group`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: ctx.user.name,
                            url: `tg://user?id=${ctx.user.id}`,
                        },
                    ],
                ],
            },
        });
    }
    catch (e) {
        yield ctx.telegram.sendMessage(ADMIN_ID, `Join group`);
    }
    yield ctx.telegram.sendMessage(ADMIN_ID, `<pre><code class="language-json">${JSON.stringify(ctx.user, null, 2)}</code></pre>`, { parse_mode: `HTML` });
});
bot.on(`chat_join_request`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, first_name } = ctx.update.chat_join_request.from;
    const res = yield users_1.default.findOne({ id });
    if (!res)
        return yield ctx.telegram.sendMessage(id, `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your student email</b>.`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `Log In With Google`,
                            url: `${GOOGLE_AUTH_URL}?id=${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id}&option=join`,
                        },
                    ],
                ],
            },
            parse_mode: `HTML`,
        });
    ctx.user = res;
    yield accept(ctx);
}));
const getClub = (ctx_1, ...args_1) => __awaiter(void 0, [ctx_1, ...args_1], void 0, function* (ctx, query = {}) {
    const club = yield clubs_1.default.findOne(query);
    if (!club)
        return yield ctx.answerCbQuery(`Club not found.`);
    const caption = `<b>${club.name}</b>\n\n${club.description}\n\n${club.links
        .map(({ url, text }) => `<a href="${url}">${text}</a>`)
        .join(` | `)}`;
    const reply_markup = {
        inline_keyboard: [
            [
                {
                    text: ctx.user.member.map((_id) => `${_id}`).includes(`${club._id}`)
                        ? `Leave`
                        : `Join`,
                    callback_data: `clb//${club._id}`,
                },
            ],
            [{ text: `All Clubs`, callback_data: `clubs` }],
        ],
    };
    return ctx.callbackQuery
        ? yield ctx.editMessageMedia({
            type: `photo`,
            media: club.cover,
            caption,
            parse_mode: `HTML`,
        }, { reply_markup })
        : yield ctx.replyWithPhoto(club.cover, {
            caption,
            parse_mode: `HTML`,
            reply_markup,
        });
});
const getClubs = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const clubs = yield clubs_1.default.find({ hidden: false });
    const media = `AgACAgIAAxkBAAIqHmcIDx23OO0mps3c52_tAAEL1rXNxQAC2ekxGzp-QUgtKkxYQQ24CwEAAwIAA3cAAzYE`;
    const caption = `Clubs:`;
    const reply_markup = {
        inline_keyboard: clubs.map(({ _id, name }) => [
            { text: name, callback_data: `club//${_id}` },
        ]),
    };
    return ctx.callbackQuery
        ? yield ctx.editMessageMedia({
            type: `photo`,
            media,
            caption,
        }, {
            reply_markup,
        })
        : yield ctx.replyWithPhoto(media, { caption, reply_markup });
});
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type) != `private`)
        return;
    yield (0, log_1.default)(ctx);
    const { id } = ctx.from;
    const option = ctx.message.text.split(` `)[1];
    const res = yield users_1.default.findOne({ id });
    if (!res)
        return yield (0, login_1.default)(ctx, option);
    ctx.user = res;
    if (option === `clubs`)
        return yield getClubs(ctx);
    if (option === `join`)
        return yield accept(ctx);
    if (option === null || option === void 0 ? void 0 : option.startsWith(`clb-`)) {
        const username = option.replace(`clb-`, ``);
        return yield getClub(ctx, { username });
    }
    return yield (0, start_1.default)(ctx);
}));
bot.on(`chosen_inline_result`, result_1.default);
bot.on(`inline_query`, inline_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type) != `private`)
        return;
    if (ctx.from) {
        const { id } = ctx.from;
        const res = yield users_1.default.findOne({ id });
        if (!res)
            return yield (0, login_1.default)(ctx);
        ctx.user = res;
    }
    yield next();
    yield (0, log_1.default)(ctx);
}));
bot.action(/^clb/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = ctx.callbackQuery.data.split(`//`)[1];
    const club = yield clubs_1.default.findOne({ _id });
    if (!club)
        return yield ctx.answerCbQuery(`Club not found.`);
    const includes = ctx.user.member.map((_id) => `${_id}`).includes(_id);
    yield ctx.user.updateOne(includes ? { $pull: { member: _id } } : { $addToSet: { member: _id } });
    yield ctx.answerCbQuery(includes ? `You left the club.` : `You joined the club.`);
    yield ctx.editMessageReplyMarkup({
        inline_keyboard: [
            [{ text: includes ? `Join` : `Leave`, callback_data: `clb//${_id}` }],
            [{ text: `All Clubs`, callback_data: `clubs` }],
        ],
    });
}));
bot.command(`clubs`, getClubs);
bot.action(`clubs`, getClubs);
bot.action(/^club/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = ctx.callbackQuery.data.split(`//`)[1];
    getClub(ctx, { _id });
}));
bot.command(`clb`, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const clubs = (yield clubs_1.default.find({}))
        .map(({ username }) => `https://t.me/pueventbot?start=clb-${username}`)
        .join(`\n`);
    yield ctx.reply(`Clubs:\n${clubs}`);
}));
bot.command(`whoami`, (ctx) => ctx.reply(`<pre><code class="language-json">${JSON.stringify(ctx.user, null, 2)}</code></pre>`, { parse_mode: `HTML` }));
(0, temp_1.tempMethod)(bot);
module.exports = bot;
