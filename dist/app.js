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
const express_1 = require("express");
const auth_1 = __importDefault(require("./routes/auth"));
const callback_1 = __importDefault(require("./routes/callback"));
const event_1 = __importDefault(require("./routes/event"));
const register_1 = __importDefault(require("./routes/register"));
const user_1 = __importDefault(require("./routes/user"));
const photo_1 = __importDefault(require("./routes/photo"));
const appRouter = (0, express_1.Router)();
const routes = [
    [`/auth`, auth_1.default],
    [`/callback`, callback_1.default],
    [`/event`, event_1.default],
    [`/registration`, register_1.default],
    [`/user`, user_1.default],
    [`/photo/:fileId`, photo_1.default],
];
for (const [route, methods] of routes) {
    for (const method in methods) {
        const handler = methods[method];
        appRouter[method](route, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield handler(req, res, next);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: `something went wrong` });
            }
        }));
    }
}
module.exports = appRouter;
