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
const registrations_1 = __importDefault(require("../models/registrations"));
const events_1 = __importDefault(require("../models/events"));
const participants = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, query: { _id } }, res) {
        var _b;
        if (!_id)
            return res.status(500).json({ message: `_id not found` });
        if (!user || (!user.organizer && !((_b = user.clubs) === null || _b === void 0 ? void 0 : _b.length)))
            return res.json([]);
        const event = yield events_1.default.findOne({ _id });
        if (!event)
            return res.status(500).json({ message: `Event not found` });
        if (`${event.author._id}` != `${user._id}` && !user.organizer)
            return res.json([]);
        return res.json((yield registrations_1.default.find({ event: _id }).populate(`user`)).map((r) => r.user));
    }),
};
module.exports = participants;
