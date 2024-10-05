"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const clubsSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    links: { type: [{ url: String, text: String }], required: true, default: [] },
    cover: { type: String, required: true },
    coordinators: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `users` }],
});
const Clubs = (0, mongoose_1.model)(`clubs`, clubsSchema);
exports.default = Clubs;
