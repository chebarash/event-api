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
const registration = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, query: { _id, registered } }, res) {
        if (!user)
            return res.json([]);
        if (_id)
            yield events_1.default.updateOne({ _id }, registered
                ? { $pull: { participants: user._id } }
                : { $push: { participants: user._id } });
        return res.json(yield events_1.default.findOne({ _id }).populate(`author`).exec());
    }),
};
module.exports = registration;
