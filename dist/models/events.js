"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    picture: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: `clubs`, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    duration: { type: Number, required: true },
    content: {
        type: { type: String, enum: [`video`, `photo`] },
        fileId: { type: String },
    },
    template: { type: String },
    button: { type: String },
    shares: { type: Number, default: 0 },
    private: { type: Boolean, required: true, default: false },
    eventId: { type: String, required: true },
    external: { type: String },
    registered: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `users`, default: [] }],
    participated: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `users`, default: [] }],
    spots: { type: Number },
    deadline: { type: Date },
    hashtags: [{ type: String, default: [] }],
    cancelled: { type: Boolean, default: false },
});
const Events = (0, mongoose_1.model)(`events`, eventSchema);
exports.default = Events;
