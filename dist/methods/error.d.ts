import { Context } from "telegraf";
declare const error: (ctx: Context, e: any) => Promise<void>;
export = error;
