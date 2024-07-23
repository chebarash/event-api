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
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("./app"));
const users_1 = __importDefault(require("./models/users"));
const telegraf_1 = require("telegraf");
const error_1 = __importDefault(require("./methods/error"));
const log_1 = __importDefault(require("./methods/log"));
const newuser_1 = __importDefault(require("./methods/newuser"));
const login_1 = __importDefault(require("./methods/login"));
const start_1 = __importDefault(require("./methods/start"));
const inline_1 = __importDefault(require("./methods/inline"));
const axios_1 = __importDefault(require("axios"));
const { TOKEN, PORT, DATABASE_URL, ADMIN_ID, GOOGLE_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET, VERCEL_URL, } = process.env;
if ([
    TOKEN,
    PORT,
    DATABASE_URL,
    ADMIN_ID,
    GOOGLE_AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CALLBACK_URL,
    GOOGLE_CLIENT_SECRET,
    VERCEL_URL,
].find((v) => !v)) {
    console.error(`Environment Variables not set`);
    process.exit(1);
}
const bot = new telegraf_1.Telegraf(TOKEN);
const app = (0, express_1.default)();
const port = PORT || 3000;
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, log_1.default)(ctx);
        const { id } = ctx.from;
        const tempId = ctx.message.text.split(` `)[1];
        if (tempId)
            yield (0, newuser_1.default)(id, tempId);
        ctx.user = (yield users_1.default.findOne({ id }));
        if (!ctx.user)
            return yield (0, login_1.default)(ctx);
        return yield (0, start_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
bot.on(`inline_query`, inline_1.default);
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.from) {
            const { id } = ctx.from;
            ctx.user = (yield users_1.default.findOne({ id }));
            if (!ctx.user)
                return yield (0, login_1.default)(ctx);
        }
        yield next();
        yield (0, log_1.default)(ctx);
    }
    catch (e) {
        yield (0, error_1.default)(ctx, e);
    }
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post(`/${TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));
app.get("/photo/:fileId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.fileId;
    if (!fileId)
        return res.status(400).send("File ID is required");
    try {
        const file = yield bot.telegram.getFile(fileId);
        if (!file.file_path)
            return res.status(404).send("File not found");
        const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
        const response = yield axios_1.default.get(fileUrl, { responseType: "stream" });
        res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
        res.setHeader("Content-Disposition", `inline; filename="photo.jpg"`);
        response.data.pipe(res);
    }
    catch (error) {
        res.status(500).send("Error fetching the file");
    }
}));
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authorization } = req.headers;
        if (authorization)
            req.user = yield users_1.default.findOne({ id: authorization });
        return next();
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ message: `Something went wrong.` });
    }
}), app_1.default);
(0, mongoose_1.connect)(DATABASE_URL)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Connected to MongoDB`);
    yield bot.telegram.setWebhook(`${VERCEL_URL}/${TOKEN}`);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}))
    .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
});
module.exports = app;
