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
const bot_1 = __importDefault(require("../bot"));
const participants = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { _id }, user }, res) {
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const event = yield events_1.default.findOne({ _id }).populate("participants");
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        if (![
            ...user.clubs.map((club) => `${club._id}`),
            `${user._id}`,
        ].includes(`${event.author}`) &&
            !user.organizer)
            return res.status(403).json({ message: "Forbidden" });
        yield bot_1.default.telegram.sendMessage(user.id, `<b>Participants of the event ${event.title}:</b>\n${event.participants
            .map(({ name, email }, i) => `<b>${i + 1}.</b> ${name} (${email})`)
            .join("\n")}`, { parse_mode: "HTML" });
        return res.json({ ok: true });
    }),
};
module.exports = participants;
