import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import { Update, Message } from "telegraf/typings/core/types/typegram";
declare const contact: (ctx: NarrowedContext<MyContext, Update.MessageUpdate<Record<"contact", {}> & Message.ContactMessage>>) => Promise<Message.TextMessage | undefined>;
export = contact;
