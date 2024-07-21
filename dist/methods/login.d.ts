import { Context } from "telegraf";
declare const login: (ctx: Context) => Promise<import("@telegraf/types").Message.TextMessage>;
export = login;
