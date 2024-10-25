"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminsSchema = new mongoose_1.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expires: { type: Date, required: true },
    calendarId: { type: String, required: true },
});
const Admins = (0, mongoose_1.model)(`admins`, adminsSchema);
exports.default = Admins;
