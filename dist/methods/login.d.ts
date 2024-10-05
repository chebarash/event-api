import { Context } from "telegraf";
declare const login: (ctx: Context, option?: string) => Promise<import("@telegraf/types").Message.TextMessage>;
export = login;
