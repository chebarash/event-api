"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const usersSchema = new mongoose_1.Schema({
    given_name: { type: String, required: true },
    family_name: { type: String, required: true },
    picture: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    id: { type: Number, required: true, unique: true },
    organizer: { type: Boolean, default: false },
});
const Users = (0, mongoose_1.model)(`users`, usersSchema);
exports.default = Users;
