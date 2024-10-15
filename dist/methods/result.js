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
const events_1 = __importDefault(require("../models/events"));
const error_1 = __importDefault(require("./error"));
const result = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield events_1.default.findOne({
            _id: ctx.chosenInlineResult.result_id,
        });
        if (!event)
            return;
        event.shares++;
        yield event.save();
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
});
module.exports = result;
