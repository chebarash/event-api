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
const registrations_1 = __importDefault(require("../models/registrations"));
const participate = {
    get: (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ user, query: { _id } }, res) {
        if (!user)
            return res.status(500).json({ message: `User not found` });
        if (!_id)
            return res.status(500).json({ message: `_id not found` });
        return res.json({
            registration: yield registrations_1.default.findOneAndUpdate({ event: _id }, { participated: Date.now() }, { new: true }),
        });
    }),
};
module.exports = participate;
