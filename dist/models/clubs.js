"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const clubsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    channel: { type: String },
    cover: { type: String, required: true },
    fg: { type: String, required: true },
    bg: { type: String, required: true },
    hidden: { type: Boolean, required: true, default: false },
    leader: { type: mongoose_1.Schema.Types.ObjectId, ref: `users`, required: true },
});
const Clubs = (0, mongoose_1.model)(`clubs`, clubsSchema);
exports.default = Clubs;
