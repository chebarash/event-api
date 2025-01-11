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
const axios_1 = __importDefault(require("axios"));
const bot_1 = __importDefault(require("../bot"));
const types = {
    photo: { type: `image/jpeg`, name: `photo.jpg` },
    video: { type: `video/mp4`, name: `video.mp4` },
};
const media = (type) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.fileId;
    if (!fileId)
        return res.status(400).send(`File ID is required`);
    try {
        const file = yield bot_1.default.telegram.getFile(fileId);
        if (!file.file_path)
            return res.status(404).send(`File not found`);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;
        const response = yield axios_1.default.get(fileUrl, { responseType: `stream` });
        res.setHeader(`Content-Type`, response.headers[`content-type`] || types[type].type);
        res.setHeader(`Content-Disposition`, `inline; filename="${types[type].name}"`);
        response.data.pipe(res);
    }
    catch (error) {
        res.status(500).json({ message: `Error fetching the file` });
    }
});
module.exports = media;
