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
const users_1 = __importDefault(require("../models/users"));
const clubs_1 = __importDefault(require("../models/clubs"));
const events_1 = __importDefault(require("../models/events"));
const index = {
    get: (_, res) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield users_1.default.countDocuments();
        const clubs = yield clubs_1.default.countDocuments({ hidden: false });
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const events = yield events_1.default.find({ date: { $gte: date } })
            .sort({ date: 1 })
            .populate([`author`, `registered`, `participated`])
            .lean()
            .exec();
        const foryou = {
            title: `Chimgan Winter Trip`,
            subtitle: `by Travel Club`,
            button: `Get Ticket`,
            image: `http://event-api.chebarash.uz/photo/AgACAgIAAxkBAAJAAmd0MXNLcZKhUzOELJz-YHhCvqlpAALS5TEb2MmgS46omyRRxvrEAQADAgADeQADNgQ`,
            link: `/events/6763c2141438c4cd016b4c60`,
        };
        res.json({ users, clubs, events, foryou });
    }),
};
module.exports = index;
