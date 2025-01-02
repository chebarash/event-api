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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = __importDefault(require("../models/events"));
const bot_1 = __importDefault(require("../bot"));
const axios_1 = __importDefault(require("axios"));
const def = {
    spots: undefined,
    deadline: undefined,
    external: undefined,
    content: undefined,
    template: undefined,
    button: undefined,
};
const event = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { gte, lte } }, res) {
        const date = {};
        if (gte)
            date[`$gte`] = new Date(gte);
        if (lte)
            date[`$lte`] = new Date(lte);
        res.json(yield events_1.default.find({ date })
            .sort({ date: 1 })
            .populate([`author`, `registered`, `participated`])
            .lean()
            .exec());
    }),
    post: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, admin, body }, res) {
        try {
            if (!(user === null || user === void 0 ? void 0 : user.clubs.length))
                return res.status(500).json({ message: `You are not organizer` });
            const startTime = new Date(body.date);
            const endTime = new Date(startTime.getTime() + body.duration);
            const { data: { id }, } = yield axios_1.default.post(`https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events`, {
                summary: body.title,
                location: body.venue,
                description: body.description,
                start: {
                    dateTime: startTime.toISOString(),
                },
                end: {
                    dateTime: endTime.toISOString(),
                },
                reminders: {
                    useDefault: false,
                    overrides: [{ method: "popup", minutes: 30 }],
                },
                attendees: [],
                guestsCanInviteOthers: false,
                guestsCanSeeOtherGuests: false,
            }, {
                headers: {
                    Authorization: `Bearer ${admin.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            body.eventId = id;
            const event = yield (yield new events_1.default(body).save()).populate([`author`, `registered`, `participated`]);
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
    put: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, admin, body }, res) {
        if (!(user === null || user === void 0 ? void 0 : user.clubs.length))
            return res.status(500).json({ message: `You are not organizer` });
        const e = yield events_1.default.findById(body._id).exec();
        if (!e)
            return res.status(500).json({ message: `Event not found` });
        if (!user.clubs
            .map(({ _id }) => `${_id}`)
            .includes(`${e.author}`))
            return res.status(403).json({ message: "Forbidden" });
        const { notification } = body, data = __rest(body, ["notification"]);
        const event = Object.assign(Object.assign({}, def), data);
        for (const key in event)
            e[key] = event[key];
        yield e.save();
        yield e.populate([`author`, `registered`, `participated`]);
        res.json(e);
        if (e === null || e === void 0 ? void 0 : e.eventId) {
            const startTime = new Date(e.date);
            const endTime = new Date(startTime.getTime() + (e.duration || 0));
            yield axios_1.default.put(`https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events/${e.eventId}`, {
                summary: e.title,
                location: e.venue,
                description: e.description,
                start: {
                    dateTime: startTime.toISOString(),
                },
                end: {
                    dateTime: endTime.toISOString(),
                },
                reminders: {
                    useDefault: false,
                    overrides: [{ method: "popup", minutes: 30 }],
                },
                attendees: e.registered.map(({ email }) => ({ email })),
                guestsCanInviteOthers: false,
                guestsCanSeeOtherGuests: false,
                status: e.cancelled ? `cancelled` : `confirmed`,
            }, {
                headers: {
                    Authorization: `Bearer ${admin.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
        }
    }),
};
module.exports = event;
