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
const newuser_1 = __importDefault(require("./methods/newuser"));
const login_1 = __importDefault(require("./methods/login"));
const start_1 = __importDefault(require("./methods/start"));
const error_1 = __importDefault(require("./methods/error"));
const inline_1 = __importDefault(require("./methods/inline"));
const users_1 = __importDefault(require("./models/users"));
const bot = new telegraf_1.Telegraf(process.env.TOKEN);
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, log_1.default)(ctx);
        const { id } = ctx.from;
        const tempId = ctx.message.text.split(` `)[1];
        if (tempId)
            yield (0, newuser_1.default)(id, tempId);
        ctx.user = (yield users_1.default.findOne({ id }));
        if (!ctx.user)
            return yield (0, login_1.default)(ctx);
        return yield (0, start_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.on(`inline_query`, inline_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.from) {
            const { id } = ctx.from;
            ctx.user = (yield users_1.default.findOne({ id }));
            if (!ctx.user)
                return yield (0, login_1.default)(ctx);
        }
        yield next();
        yield (0, log_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
module.exports = bot;
