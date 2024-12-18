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
const action_1 = __importDefault(require("./action"));
const { GROUP } = process.env;
const accept = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.telegram.approveChatJoinRequest(GROUP, ctx.user.id);
        ctx.user.joined = true;
        yield ctx.user.save();
        return yield (0, action_1.default)(ctx);
    }
    catch (e) {
        console.error(e);
    }
});
module.exports = accept;
