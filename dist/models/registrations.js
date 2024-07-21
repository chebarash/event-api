"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const registrationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", required: true },
    event: { type: mongoose_1.Schema.Types.ObjectId, ref: "events", required: true },
    date: { type: Date, default: Date.now },
    participated: { type: Date },
    rate: { type: Number },
    comment: { type: String },
});
registrationSchema.index({ user: 1, event: 1 }, { unique: true });
const Registrations = (0, mongoose_1.model)("registrations", registrationSchema);
exports.default = Registrations;
