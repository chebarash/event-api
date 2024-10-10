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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const mongoose_1 = require("mongoose");
const clubs_1 = __importDefault(require("./clubs"));
const usersSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    picture: { type: String },
    email: { type: String, required: true, unique: true },
    id: { type: Number, required: true, unique: true },
    organizer: { type: Boolean, default: false },
    member: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `clubs` }],
});
const Users = (0, mongoose_1.model)(`users`, usersSchema);
const getUser = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (match = {}) {
    const user = (yield Users.findOne(match).lean());
    if (!user)
        return null;
    user.clubs = yield clubs_1.default.find({ coordinators: user._id }).lean();
    return user;
});
exports.getUser = getUser;
exports.default = Users;
