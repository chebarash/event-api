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
const notification = {
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const currentTime = new Date();
        const time30 = new Date(currentTime.getTime() + 30 * 60 * 1000);
        const preEvent = yield events_1.default.find({
            date: { $lte: time30 },
            cancelled: false,
            "notification.pre": false,
        }).populate(`registered`);
        const postEvent = yield events_1.default.find({
            date: { $lte: currentTime },
            cancelled: false,
            "notification.post": false,
        }).populate({
            path: `author`,
            populate: {
                path: `leader`,
            },
        });
        let sent = false;
        for (const event of preEvent) {
            for (const { id } of event.registered) {
                try {
                    yield bot_1.default.telegram.sendPhoto(id, event.picture, {
                        caption: `Just 30 minutes until <b>${event.title}</b> kicks off`,
                        parse_mode: `HTML`,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: `Ticket`,
                                        url: `https://t.me/pueventbot/event?startapp=ticket${event._id}`,
                                    },
                                ],
                            ],
                        },
                    });
                }
                catch (e) {
                    console.log(e);
                }
            }
            event.notification.pre = true;
            yield event.save();
            sent = true;
        }
        for (const event of postEvent) {
            const eventEndTime = new Date(event.date);
            eventEndTime.setTime(eventEndTime.getTime() + event.duration);
            if (eventEndTime <= new Date()) {
                try {
                    const link = {
                        "entry.203470451": event._id,
                        "entry.30472541": event.author.name,
                        "entry.1777031597": event.date.toISOString().split("T")[0],
                        "entry.297865307": event.title,
                        "entry.1608372114": event.venue,
                        "entry.919785868": event.registered.length,
                        "entry.542587563": event.participated.length,
                    };
                    const linkString = Object.entries(link)
                        .map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`)
                        .join("&");
                    yield bot_1.default.telegram.sendMessage(event.author.leader.id, `Just a quick reminder to fill out the <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuddmhm0Og2h2B8uHxBpEhbJrjKb4i-nzzIEEpwch0f02tAw/viewform?usp=pp_url&${linkString}">event report form</a> for <b>${event.title}</b>.`, {
                        parse_mode: `HTML`,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: `Open in Event`,
                                        url: `https://t.me/pueventbot/event?startapp=${event._id}`,
                                    },
                                ],
                            ],
                        },
                    });
                }
                catch (e) {
                    console.log(e);
                }
                event.notification.post = true;
                yield event.save();
                sent = true;
            }
        }
        res.status(200).json({
            success: true,
            message: sent ? `Notifications sent!` : `No events to notify.`,
        });
    }),
};
module.exports = notification;
