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
};
exports.tempMethod = tempMethod;
