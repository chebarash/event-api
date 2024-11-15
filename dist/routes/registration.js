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
const axios_1 = __importDefault(require("axios"));
const registration = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, admin, query: { _id, registered } }, res) {
        if (!user)
            return res.json([]);
        if (!_id)
            return res.json([]);
        const event = yield events_1.default.findOneAndUpdate({ _id }, registered
            ? { $pull: { participants: user._id } }
            : { $addToSet: { participants: user._id } }, { new: true, useFindAndModify: false })
            .populate([`author`, `participants`])
            .exec();
        res.json(Object.assign(Object.assign({}, event === null || event === void 0 ? void 0 : event.toObject()), { participants: event === null || event === void 0 ? void 0 : event.populated(`participants`) }));
        if (event === null || event === void 0 ? void 0 : event.eventId) {
            const startTime = new Date(event.date);
            const endTime = new Date(startTime.getTime() + (event.duration || 0));
            yield axios_1.default.put(`https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events/${event.eventId}`, {
                summary: event.title,
                location: event.venue,
                description: event.description,
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
                attendees: event.participants.map(({ email }) => ({ email })),
                guestsCanInviteOthers: false,
                guestsCanSeeOtherGuests: false,
                status: event.cancelled ? `cancelled` : `confirmed`,
            }, {
                headers: {
                    Authorization: `Bearer ${admin.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
        }
    }),
};
module.exports = registration;
