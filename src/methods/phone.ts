import { MyContext } from "../types/types";

const phoneNumber = async (ctx: MyContext) =>
  await ctx.telegram.sendMessage(
    ctx.from!.id,
    `To continue, please provide your phone number:`,
    {
      reply_markup: {
        keyboard: [[{ text: `Send Phone Number`, request_contact: true }]],
        resize_keyboard: true,
      },
    }
  );

export = phoneNumber;
