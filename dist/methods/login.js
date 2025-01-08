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
const { GOOGLE_AUTH_URL } = process.env;
const login = (ctx, option) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const url = `${GOOGLE_AUTH_URL}?id=${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id}`;
    if (option == `notnewuu`)
        return yield ctx.telegram.sendMessage(ctx.from.id, `You must <b>log in using your your New Uzbekistan University email address</b>  <code>(@newuu.uz)</code>.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`, {
            reply_markup: {
                inline_keyboard: [[{ text: `Try again`, url }]],
            },
            parse_mode: `HTML`,
        });
    if (option == `external`)
        return yield ctx.telegram.sendMessage(ctx.from.id, `Welcome to the bot where you can become part of the university community.\n\nYou are lucky, log in with any gmail account.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `Log In With Google`, url: `${url}&option=external` }],
                ],
            },
            parse_mode: `HTML`,
        });
    return yield ctx.telegram.sendMessage(ctx.from.id, `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your your New Uzbekistan University email address</b>  <code>(@newuu.uz)</code>.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: `Log In With Google`, url: `${url}&option=${option}` }],
            ],
        },
        parse_mode: `HTML`,
    });
});
module.exports = login;
