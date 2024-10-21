"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = void 0;
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    picture: { type: String, required: true },
    description: { type: String, required: true },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: "authorModel",
        required: true,
    },
    authorModel: { type: String, enum: [`users`, `clubs`], required: true },
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
    external: { type: String },
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: `users`, default: [] }],
    spots: { type: Number },
    deadline: { type: Date },
});
const Events = (0, mongoose_1.model)(`events`, eventSchema);
const getEvents = (match = {}) => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return Events.find(Object.assign(Object.assign({}, match), { date: { $gte: date } }))
        .sort({ date: 1 })
        .populate(`author`)
        .lean()
        .exec();
};
exports.getEvents = getEvents;
exports.default = Events;
