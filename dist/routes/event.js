"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const events_1 = __importStar(require("../models/events"));
const bot_1 = __importDefault(require("../bot"));
const axios_1 = __importDefault(require("axios"));
const event = {
    get: (_, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield (0, events_1.getEvents)());
    }),
    post: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, body }, res) {
        try {
            if (!(user === null || user === void 0 ? void 0 : user.organizer) && !(user === null || user === void 0 ? void 0 : user.clubs.length))
                return res.status(500).json({ message: `You are not organizer` });
            const startTime = new Date(body.date);
            const endTime = new Date(startTime.getTime() + body.duration);
            const { data: { id }, } = yield axios_1.default.post(`https://www.googleapis.com/calendar/v3/calendars/${user.calendarId}/events`, {
                summary: body.title,
                location: body.venue,
                description: body.description,
                start: {
                    dateTime: startTime.toISOString(),
                },
                end: {
                    dateTime: endTime.toISOString(),
                },
                attendees: [],
            }, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            body.eventId = id;
            body.calendarId = user.calendarId;
            const event = yield (yield new events_1.default(body).save()).populate(`author`);
            yield bot_1.default.telegram.sendMessage(process.env.ADMIN_ID, `New Event by ${event.author.name}`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: event.title,
                                url: `https://t.me/pueventbot/event?startapp=${event._id}`,
                            },
                            { text: `delete`, callback_data: `delete//${event._id}` },
                        ],
                    ],
                },
            });
            res.json(event);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: `Wrong data` });
        }
    }),
};
module.exports = event;
