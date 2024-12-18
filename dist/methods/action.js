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
const { LOGS } = process.env;
const action = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, name, phone, joined, picture } = ctx.user;
    const extra = {
        caption: `<pre><code class="language-json">${JSON.stringify({ id, email, name, phone, joined }, null, 2)}</code></pre>`,
        parse_mode: `HTML`,
    };
    const log = ctx.telegram.sendPhoto.bind(ctx.telegram, LOGS, {
        url: picture || `https://event.chebarash.uz/profile.png`,
    });
    try {
        yield log(Object.assign(Object.assign({}, extra), { reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: ctx.from.first_name,
                            url: `tg://user?id=${ctx.user.id}`,
                        },
                    ],
                ],
            } }));
    }
    catch (e) {
        yield log(extra);
    }
});
module.exports = action;
