import { MyContext } from "../types/types";
declare const phoneNumber: (ctx: MyContext) => Promise<import("@telegraf/types").Message.TextMessage>;
export = phoneNumber;
