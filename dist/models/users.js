"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const usersSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    picture: { type: String },
    email: { type: String, required: true, unique: true },
    id: { type: Number, required: true, unique: true },
    member: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `clubs`, default: [] }],
    clubs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `clubs`, default: [] }],
    phone: { type: String },
    joined: { type: Boolean, default: false, required: true },
});
const Users = (0, mongoose_1.model)(`users`, usersSchema);
exports.default = Users;
