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
const temp_1 = __importDefault(require("../temp"));
const newuser = (id, tempId) => __awaiter(void 0, void 0, void 0, function* () {
    temp_1.default[tempId].id = id;
    if (yield users_1.default.findOne({ email: temp_1.default[tempId].email }))
        return yield users_1.default.updateOne({ email: temp_1.default[tempId].email }, temp_1.default[tempId]);
    return yield new users_1.default(temp_1.default[tempId]).save();
});
module.exports = newuser;
