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
const mongoose_1 = require("mongoose");
const users_1 = __importDefault(require("./models/users"));
const app_1 = __importDefault(require("./app"));
const bot_1 = __importDefault(require("./bot"));
const { TOKEN, PORT, DATABASE_URL, ADMIN_ID, GOOGLE_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET, VERCEL_URL, DEV, } = process.env;
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
].some((v) => !v)) {
    console.error(`Environment Variables not set`);
    process.exit(1);
}
const app = (0, express_1.default)();
const port = PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post(`/${TOKEN}`, (req, res) => bot_1.default.handleUpdate(req.body, res));
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authorization } = req.headers;
        if (authorization)
            req.user = yield users_1.default.findOne({ id: authorization });
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
    DEV
        ? bot_1.default.launch()
        : yield bot_1.default.telegram.setWebhook(`${VERCEL_URL}/${TOKEN}`);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}))
    .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
});
module.exports = app;
