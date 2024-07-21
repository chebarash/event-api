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
const { ADMIN_ID } = process.env;
const adminId = parseInt(ADMIN_ID);
const log = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.from)
        return;
    const { id, first_name, username } = ctx.from;
    try {
        yield ctx.copyMessage(adminId, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: username || first_name,
                            url: `tg://user?id=${id}`,
                        },
                    ],
                ],
            },
        });
    }
    catch (e) {
        yield ctx.copyMessage(adminId);
        if (e.message != `400: Bad Request: BUTTON_USER_PRIVACY_RESTRICTED`)
            yield ctx.telegram.sendMessage(adminId, `<pre><code class="language-json">${JSON.stringify(Object.assign(Object.assign({ message: e.message }, e), { update: ctx.update }), null, 2)}</code></pre>`, { parse_mode: `HTML` });
    }
});
module.exports = log;
