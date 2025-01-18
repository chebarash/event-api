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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
const users_1 = __importDefault(require("./models/users"));
const admin_1 = __importDefault(require("./models/admin"));
const app_1 = __importDefault(require("./app"));
const bot_1 = __importDefault(require("./bot"));
const media_1 = __importDefault(require("./routes/media"));
const { TOKEN, PORT, DATABASE_URL, ADMIN_ID, GOOGLE_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET, VERCEL_URL, DEV, GROUP, LOGS, } = process.env;
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
    GROUP,
    LOGS,
].some((v) => !v)) {
    console.error(`Environment Variables not set`);
    process.exit(1);
}
const app = (0, express_1.default)();
const port = PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post(`/${TOKEN}`, (req, res) => bot_1.default.handleUpdate(req.body, res));
app.get(`/photo/:fileId`, (0, media_1.default)(`photo`));
app.get(`/video/:fileId`, (0, media_1.default)(`video`));
app.get(`/connect`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ result: yield bot_1.default.telegram.setWebhook(`${VERCEL_URL}/${TOKEN}`) });
}));
const getId = (initData) => {
    const data = new URLSearchParams(initData);
    const hash = data.get("hash");
    const dataToCheck = [];
    data.sort();
    data.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));
    const user = data.get(`user`);
    const secret = crypto_1.default
        .createHmac("sha256", "WebAppData")
        .update(TOKEN)
        .digest();
    const _hash = crypto_1.default
        .createHmac("sha256", secret)
        .update(dataToCheck.join("\n"))
        .digest("hex");
    return hash === _hash && user ? JSON.parse(user).id : null;
};
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield admin_1.default.findOne();
        if (!admin)
            return res.status(500).json({ message: `Admin not found` });
        if (admin.expires < new Date()) {
            const { data: { access_token, expires_in }, } = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: admin.refreshToken,
                grant_type: "refresh_token",
            });
            admin.accessToken = access_token;
            admin.expires = new Date(Date.now() + expires_in * 1000);
            yield admin.save();
        }
        req.admin = admin;
        const { authorization } = req.headers;
        if (authorization === null || authorization === void 0 ? void 0 : authorization.startsWith(`tma `)) {
            const initData = authorization.replace(`tma `, ``);
            const id = getId(initData);
            if (!id)
                return res.status(401).json({ message: `Unauthorized` });
            const user = yield users_1.default.findOne({ id }).populate([`clubs`, `member`]);
            if (user)
                req.user = user;
        }
        return next();
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: `Something went wrong.` });
    }
}), app_1.default);
(0, mongoose_1.connect)(DATABASE_URL)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Connected to MongoDB`);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}))
    .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
});
module.exports = app;
