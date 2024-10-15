import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import { Update } from "telegraf/typings/core/types/typegram";
declare const result: (ctx: NarrowedContext<MyContext, Update.ChosenInlineResultUpdate>) => Promise<void>;
export = result;
