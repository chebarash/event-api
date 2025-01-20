"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const forYouSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    button: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
});
const ForYou = (0, mongoose_1.model)(`foryou`, forYouSchema);
exports.default = ForYou;
