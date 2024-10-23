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
const bot = new telegraf_1.Telegraf(process.env.TOKEN);
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
    try {
        yield (0, log_1.default)(ctx);
        const { id } = ctx.from;
        const option = ctx.message.text.split(` `)[1];
        const res = yield users_1.default.findOne({ id });
        if (!res)
            return yield (0, login_1.default)(ctx, option);
        ctx.user = res;
        if (option === `clubs`)
            return yield getClubs(ctx);
        if (option === null || option === void 0 ? void 0 : option.startsWith(`clb-`)) {
            const username = option.replace(`clb-`, ``);
            return yield getClub(ctx, { username });
        }
        return yield (0, start_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.on(`chosen_inline_result`, result_1.default);
bot.on(`inline_query`, inline_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.from) {
            const { id } = ctx.from;
            const res = yield users_1.default.findOne({ id });
            if (!res)
                return yield (0, login_1.default)(ctx);
            ctx.user = res;
        }
        yield next();
        yield (0, log_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.action(/^clb/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = ctx.callbackQuery.data.split(`//`)[1];
    const club = yield clubs_1.default.findOne({ _id });
    if (!club)
        return yield ctx.answerCbQuery(`Club not found.`);
    const includes = ctx.user.member.map((_id) => `${_id}`).includes(_id);
    yield ctx.user.updateOne(includes ? { $pull: { member: _id } } : { $push: { member: _id } });
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
    try {
        const clubs = (yield clubs_1.default.find({}))
            .map(({ username }) => `https://t.me/pueventbot?start=clb-${username}`)
            .join(`\n`);
        yield ctx.reply(`Clubs:\n${clubs}`);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.command(`whoami`, (ctx) => ctx.reply(`<pre><code class="language-json">${JSON.stringify(ctx.user, null, 2)}</code></pre>`, { parse_mode: `HTML` }));
(0, temp_1.tempMethod)(bot);
module.exports = bot;
