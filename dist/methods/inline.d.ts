import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import { Update } from "telegraf/typings/core/types/typegram";
declare const inline: (ctx: NarrowedContext<MyContext, Update.InlineQueryUpdate>) => Promise<true>;
export = inline;
