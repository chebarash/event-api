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
const updateTopClubs = () => __awaiter(void 0, void 0, void 0, function* () {
    const clubs = yield clubs_1.default.find({ hidden: false })
        .populate(`leader`)
        .lean();
    const users = yield users_1.default.find({
        member: { $exists: true, $not: { $size: 0 } },
    }).lean();
    for (const club of clubs)
        club.members = users.filter((user) => user.member.some((member) => `${member}` === `${club._id}`));
    topClubs = clubs.sort((a, b) => b.members.length - a.members.length);
    validTime = Date.now() + 1000 * 60;
});
const clubs = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { _id } }, res) {
        if (!topClubs || Date.now() > validTime)
            yield updateTopClubs();
        if (!_id)
            return res.json(topClubs);
        const index = topClubs.findIndex((club) => club._id.toString() === _id);
        let club;
        if (index === -1) {
            const c = yield clubs_1.default.findOne({ hidden: true, _id })
                .populate(`leader`)
                .lean();
            if (c)
                club = Object.assign(Object.assign({}, c), { members: yield users_1.default.find({ member: _id }).lean() });
            else
                return res.status(404).json({ message: `Club not found` });
        }
        else
            club = topClubs[index];
        const events = yield events_1.default.find({ author: _id })
            .sort({ date: -1 })
            .lean()
            .exec();
        const chat = yield bot_1.default.telegram.getChat(club.leader.id);
        let username = `chebarash`;
        if (chat.type == `private` && chat.username)
            username = chat.username;
        res.json(Object.assign(Object.assign({}, club), { rank: index + 1, events, username }));
    }),
    post: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body: { _id, userId }, user }, res) {
        if (!user)
            return res.status(401).json({ message: `Login to join` });
        if (!_id)
            return res.status(400).json({ message: `Club not found` });
        const club = yield clubs_1.default.findOne({ _id });
        if (!club)
            return res.status(404).json({ message: `Club not found` });
        if (`${club.leader}` === `${user._id}` && userId) {
            yield users_1.default.findByIdAndUpdate(userId, { $pull: { member: _id } });
            yield updateTopClubs();
            const index = topClubs.findIndex((club) => club._id.toString() === _id);
            const events = yield events_1.default.find({ author: _id })
                .sort({ date: -1 })
                .lean()
                .exec();
            return res.json(Object.assign(Object.assign({}, topClubs[index]), { rank: index + 1, events }));
        }
        if (!user.email.endsWith(`@newuu.uz`))
            return res.status(403).json({ message: `Only students can join` });
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
        if (!topClubs || Date.now() > validTime)
            yield updateTopClubs();
        const index = topClubs.findIndex((club) => club._id.toString() === body._id);
        const events = yield events_1.default.find({ author: body._id })
            .sort({ date: -1 })
            .lean()
            .exec();
        res.json(Object.assign(Object.assign({}, (yield clubs_1.default.findById(club._id).populate(`leader`).lean())), { rank: index + 1, events }));
    }),
};
module.exports = clubs;
