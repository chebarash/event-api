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
const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;
const auth = {
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.query.id || (yield users_1.default.findOne({ id: req.query.id })))
            return res.redirect(`https://t.me/pueventbot?start=${req.query.option}`);
        return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${GOOGLE_CALLBACK_URL}`)}&access_type=offline&response_type=code&state=${encodeURIComponent(JSON.stringify({
            id: req.query.id,
            option: req.query.option,
        }))}&scope=openid%20email%20profile`);
    }),
};
module.exports = auth;
