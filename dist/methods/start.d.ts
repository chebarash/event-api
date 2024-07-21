import { MyContext } from "../types/types";
declare const start: (ctx: MyContext) => Promise<import("@telegraf/types").Message.TextMessage>;
export = start;
