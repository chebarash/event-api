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
const filters_1 = require("telegraf/filters");
const users_1 = __importDefault(require("./models/users"));
const clubs_1 = __importDefault(require("./models/clubs"));
const temp_1 = require("./methods/temp");
const phone_1 = __importDefault(require("./methods/phone"));
const contact_1 = __importDefault(require("./methods/contact"));
const clubs_2 = __importDefault(require("./methods/clubs"));
const accept_1 = __importDefault(require("./methods/accept"));
const inline_1 = __importDefault(require("./methods/inline"));
const result_1 = __importDefault(require("./methods/result"));
const club_1 = __importDefault(require("./methods/club"));
const login_1 = __importDefault(require("./methods/login"));
const start_1 = __importDefault(require("./methods/start"));
const error_1 = __importDefault(require("./methods/error"));
const left_1 = __importDefault(require("./methods/left"));
const log_1 = __importDefault(require("./methods/log"));
const { TOKEN, GROUP, LOGS } = process.env;
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
    if (![GROUP, LOGS].includes(`${ctx.chat.id}`))
        yield ctx.leaveChat();
}));
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
    if (!ctx.user.phone)
        return yield (0, phone_1.default)(ctx);
    if (option === `clubs`)
        return yield (0, clubs_2.default)(ctx);
    if (option === null || option === void 0 ? void 0 : option.startsWith(`clb-`)) {
        const username = option.replace(`clb-`, ``);
        return yield (0, club_1.default)(ctx, { username });
    }
    yield (0, accept_1.default)(ctx);
    return yield (0, start_1.default)(ctx);
}));
bot.on(`contact`, contact_1.default);
bot.on(`chosen_inline_result`, result_1.default);
bot.on(`inline_query`, inline_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (ctx.from) {
        if (ctx.from.is_bot)
            return;
        const { id } = ((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.left_chat_member) || ctx.from;
        const res = yield users_1.default.findOne({ id });
        if (!res)
            return yield (0, login_1.default)(ctx);
        ctx.user = res;
        if (!ctx.user.phone)
            return yield (0, phone_1.default)(ctx);
    }
    yield next();
    if (ctx.chat && ctx.chat.type == `private`)
        yield (0, log_1.default)(ctx);
}));
bot.on(`chat_join_request`, accept_1.default);
bot.on((0, filters_1.message)(`left_chat_member`), left_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type) != `private`)
        return;
    yield next();
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
bot.command(`clubs`, clubs_2.default);
bot.action(`clubs`, clubs_2.default);
bot.action(/^club/g, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = ctx.callbackQuery.data.split(`//`)[1];
    (0, club_1.default)(ctx, { _id });
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
