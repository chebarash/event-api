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
const clubs = {
    get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const clubs = yield clubs_1.default.find({ hidden: false });
        const clubList = yield Promise.all(clubs.map((club) => __awaiter(void 0, void 0, void 0, function* () {
            const membersCount = yield users_1.default.countDocuments({
                member: club._id,
            });
            return { name: club.name, members: membersCount };
        })));
        res.json(clubList.sort((a, b) => b.members - a.members));
    }),
};
module.exports = clubs;
