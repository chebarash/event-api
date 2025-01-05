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
const vote = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { _id, option }, user }, res) {
        if (!option || typeof option != `string`)
            return res.status(400).json({ message: "Option is required" });
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const event = yield events_1.default.findOne({ _id });
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        if (!event.voting)
            return res
                .status(400)
                .json({ message: "Voting is not enabled for this event" });
        const votes = event.voting.votes.filter((vote) => `${vote.user}` != `${user._id}`);
        votes.push({ user, option });
        const r = yield events_1.default.findOneAndUpdate({ _id }, { $set: { "voting.votes": votes } }, { new: true, useFindAndModify: false })
            .populate([`author`, `registered`, `participated`])
            .exec();
        return res.json(r);
    }),
};
module.exports = vote;
