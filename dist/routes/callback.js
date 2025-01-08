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
const users_1 = __importDefault(require("../models/users"));
const axios_1 = __importDefault(require("axios"));
const bot_1 = __importDefault(require("../bot"));
const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET, GROUP } = process.env;
const callback = {
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { code, state } = req.query;
        const { data: { id_token }, } = yield axios_1.default.post(`https://oauth2.googleapis.com/token`, {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_CALLBACK_URL,
            grant_type: `authorization_code`,
        });
        const { data: { email, picture, given_name, family_name }, } = yield axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        const { id, option, from } = typeof state == `string` ? JSON.parse(state) : {};
        if (!email.endsWith(`@newuu.uz`) && option != `external`)
            return res.redirect(`https://t.me/pueventbot?start=notnewuu`);
        const old = yield users_1.default.findOne({ email });
        if (old) {
            try {
                old.joined = false;
                yield old.save();
                yield bot_1.default.telegram.banChatMember(GROUP, old.id);
                yield bot_1.default.telegram.unbanChatMember(GROUP, old.id);
                yield bot_1.default.telegram.sendMessage(old.id, `You are removed from group since you changed account`);
            }
            catch (e) {
                console.error(e);
            }
        }
        yield users_1.default.updateOne({ email }, {
            name: [given_name, family_name]
                .map((v) => v.charAt(0).toUpperCase() + v.slice(1).toLocaleLowerCase())
                .join(` `),
            picture,
            email,
            id,
        }, { upsert: true });
        return res.redirect(from || `https://t.me/pueventbot?start=${option}`);
    }),
};
module.exports = callback;
