import login from "./login";
import accept from "./accept";
import Users from "../models/users";
import start from "./start";
import { NarrowedContext } from "telegraf";
import { MyContext } from "../types/types";
import { Update, Message } from "telegraf/typings/core/types/typegram";

const contact = async (
  ctx: NarrowedContext<
    MyContext,
    Update.MessageUpdate<Record<"contact", {}> & Message.ContactMessage>
  >
) => {
  if (ctx.chat?.type != `private`) return;
  const { phone_number } = ctx.message.contact;
  const { id } = ctx.from;
  const res = await Users.findOne({ id });
  if (!res) return await login(ctx);
  if (!phone_number.replace(`+`, ``).startsWith(`998`))
    return await ctx.reply(`Please provide a valid phone number.`);
  res.phone = phone_number;
  await res.save();
  ctx.user = res;
  await ctx.reply(`Phone number saved.`, {
    reply_markup: { remove_keyboard: true },
  });
  try {
    await accept(ctx);
  } catch (e) {
    console.log(e);
  }
  return await start(ctx);
};

export = contact;
