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
const login_1 = __importDefault(require("./login"));
const accept_1 = __importDefault(require("./accept"));
const users_1 = __importDefault(require("../models/users"));
const start_1 = __importDefault(require("./start"));
const contact = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.type) != `private`)
        return;
    const { phone_number } = ctx.message.contact;
    const { id } = ctx.from;
    const res = yield users_1.default.findOne({ id });
    if (!res)
        return yield (0, login_1.default)(ctx);
    res.phone = phone_number;
    yield res.save();
    ctx.user = res;
    yield ctx.reply(`Phone number saved.`, {
        reply_markup: { remove_keyboard: true },
    });
    try {
        yield (0, accept_1.default)(ctx);
    }
    catch (e) {
        console.log(e);
    }
    return yield (0, start_1.default)(ctx);
});
module.exports = contact;
