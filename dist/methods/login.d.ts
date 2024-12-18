import { MyContext } from "../types/types";
declare const login: (ctx: MyContext, option?: string) => Promise<import("@telegraf/types").Message.TextMessage>;
export = login;
