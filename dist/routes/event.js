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
const events_1 = require("../models/events");
const registrations_1 = __importDefault(require("../models/registrations"));
const event = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user }, res) {
        const events = yield (0, events_1.getEvents)();
        if (user) {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const registrations = yield registrations_1.default.find({
                user: user._id,
                date: { $gte: date },
            });
            if (registrations && registrations.length)
                for (let i = 0; i < events.length; i++)
                    if (registrations.some(({ event }) => `${event}` == `${events[i]._id}`))
                        events[i].registered = true;
        }
        res.json(events);
    }),
};
module.exports = event;
