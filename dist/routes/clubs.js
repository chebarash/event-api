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
const bot_1 = __importDefault(require("../bot"));
let topClubs;
let validTime = 0;
const clubs = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { _id } }, res) {
        if (!topClubs || Date.now() > validTime) {
            const clubs = yield clubs_1.default.find().populate(`leader`).lean();
            const users = yield users_1.default.find({
                member: { $exists: true, $not: { $size: 0 } },
            }).lean();
            for (const club of clubs)
                club.members = users.filter((user) => user.member.some((member) => `${member}` === `${club._id}`));
            topClubs = clubs.sort((a, b) => b.members.length - a.members.length);
            validTime = Date.now() + 1000 * 60;
        }
        if (!_id)
            return res.json(topClubs);
        const index = topClubs.findIndex((club) => club._id.toString() === _id);
        if (index === -1)
            return res.status(404).json({ message: `Club not found` });
        const events = yield events_1.default.find({ author: _id })
            .sort({ date: -1 })
            .lean()
            .exec();
        const chat = yield bot_1.default.telegram.getChat(topClubs[index].leader.id);
        let username = `chebarash`;
        if (chat.type == `private` && chat.username)
            username = chat.username;
        res.json(Object.assign(Object.assign({}, topClubs[index]), { rank: index + 1, events, username }));
    }),
    post: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body: { _id }, user }, res) {
        if (!user)
            return res.status(401).json({ message: `Login to join` });
        if (!user.email.endsWith(`@newuu.uz`))
            return res.status(403).json({ message: `Only students can join` });
        if (!_id)
            return res.status(400).json({ message: `Club not found` });
        const club = yield clubs_1.default.findOne({ _id });
        if (!club)
            return res.status(404).json({ message: `Club not found` });
        const isMember = user.member.some((club) => `${club._id}` === _id);
        yield user.updateOne(isMember ? { $pull: { member: _id } } : { $addToSet: { member: _id } });
        res.json(yield users_1.default.findById(user._id).populate([`clubs`, `member`]).lean());
    }),
    put: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body, user }, res) {
        if (!user)
            return res.status(401).json({ message: `Login to join` });
        if (!body._id)
            return res.status(400).json({ message: `Club not found` });
        const club = yield clubs_1.default.findOne({ _id: body._id });
        if (!club)
            return res.status(404).json({ message: `Club not found` });
        if (`${club.leader}` !== `${user._id}`)
            return res.status(403).json({ message: `Not a leader` });
        yield club.updateOne({
            description: body.description,
            channel: body.channel,
            cover: body.cover,
            fg: body.fg,
            bg: body.bg,
        });
        const clubs = yield clubs_1.default.find().populate(`leader`).lean();
        const clubList = yield Promise.all(clubs.map((club) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, club), { members: yield users_1.default.countDocuments({
                    member: club._id,
                }) }));
        })));
        const topClubs = clubList.sort((a, b) => b.members - a.members);
        const index = topClubs.findIndex((club) => club._id.toString() === body._id);
        const events = yield events_1.default.find({ author: body._id })
            .sort({ date: -1 })
            .lean()
            .exec();
        res.json(Object.assign(Object.assign({}, topClubs[index]), { rank: index + 1, events }));
    }),
};
module.exports = clubs;
