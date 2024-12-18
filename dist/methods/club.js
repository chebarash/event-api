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
module.exports = getClub;
