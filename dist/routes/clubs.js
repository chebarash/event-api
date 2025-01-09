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
const clubs = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ query: { _id } }, res) {
        const clubs = yield clubs_1.default.find().populate(`leader`).lean();
        const clubList = yield Promise.all(clubs.map((club) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, club), { members: yield users_1.default.countDocuments({
                    member: club._id,
                }) }));
        })));
        const topClubs = clubList.sort((a, b) => b.members - a.members);
        if (!_id)
            return res.json(topClubs);
        const index = topClubs.findIndex((club) => club._id.toString() === _id);
        if (index === -1)
            return res.status(404).json({ message: `Club not found` });
        const events = yield events_1.default.find({ author: _id }).lean();
        res.json(Object.assign(Object.assign({}, topClubs[index]), { rank: index + 1, events }));
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
            color: body.color,
        });
        const clubs = yield clubs_1.default.find().populate(`leader`).lean();
        const clubList = yield Promise.all(clubs.map((club) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, club), { members: yield users_1.default.countDocuments({
                    member: club._id,
                }) }));
        })));
        const topClubs = clubList.sort((a, b) => b.members - a.members);
        const index = topClubs.findIndex((club) => club._id.toString() === body._id);
        const events = yield events_1.default.find({ author: body._id }).lean();
        res.json(Object.assign(Object.assign({}, topClubs[index]), { rank: index + 1, events }));
    }),
};
module.exports = clubs;
