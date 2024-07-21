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
const temp_1 = __importDefault(require("../temp"));
const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } = process.env;
const callback = {
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { code } = req.query;
        const response = yield fetch(`https://oauth2.googleapis.com/token`, {
            method: `POST`,
            body: JSON.stringify({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_CALLBACK_URL,
                grant_type: `authorization_code`,
            }),
        });
        const { id_token } = yield response.json();
        const token_info_response = yield fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        if (token_info_response.status == 200) {
            const tempId = (Math.random() + 1).toString(36).substring(7);
            const { given_name, family_name, picture, email } = yield token_info_response.json();
            temp_1.default[tempId] = { given_name, family_name, picture, email };
            return res.redirect(`https://t.me/pueventbot?start=${tempId}`);
        }
        res.status(token_info_response.status).json({ error: true });
    }),
};
module.exports = callback;
