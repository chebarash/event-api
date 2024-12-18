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
const clubs_1 = __importDefault(require("../models/clubs"));
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
module.exports = getClubs;
