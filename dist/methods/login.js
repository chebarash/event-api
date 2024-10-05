"use strict";
const { GOOGLE_AUTH_URL } = process.env;
const login = (ctx, option) => {
    var _a;
    return ctx.reply(`Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your student email</b>.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Log In With Google`,
                        url: `${GOOGLE_AUTH_URL}?id=${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id}&option=${option}`,
                    },
                ],
            ],
        },
        parse_mode: `HTML`,
    });
};
module.exports = login;
