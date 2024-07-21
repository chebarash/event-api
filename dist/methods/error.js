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
const error = (ctx, e) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(e);
    yield ctx.telegram.sendMessage(adminId, `<pre><code class="language-json">${JSON.stringify(Object.assign(Object.assign({ message: e.message }, e), { update: ctx.update }), null, 2)}</code></pre>`, { parse_mode: `HTML` });
});
module.exports = error;
