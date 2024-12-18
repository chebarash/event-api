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
const participants_1 = __importDefault(require("./routes/participants"));
const registration_1 = __importDefault(require("./routes/registration"));
const callback_1 = __importDefault(require("./routes/callback"));
const event_1 = __importDefault(require("./routes/event"));
const photo_1 = __importDefault(require("./routes/photo"));
const clubs_1 = __importDefault(require("./routes/clubs"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const routes_1 = __importDefault(require("./routes"));
const appRouter = (0, express_1.Router)();
const routes = [
    [`/`, routes_1.default],
    [`/auth`, auth_1.default],
    [`/clubs`, clubs_1.default],
    [`/callback`, callback_1.default],
    [`/event`, event_1.default],
    [`/registration`, registration_1.default],
    [`/user`, user_1.default],
    [`/photo/:fileId`, photo_1.default],
    [`/participants`, participants_1.default],
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
