import { MyContext } from "../types/types";

const { GOOGLE_AUTH_URL } = process.env;

const login = async (ctx: MyContext, option?: string) => {
  const url = `${GOOGLE_AUTH_URL}?id=${ctx.from?.id}`;
  if (option == `notnewuu`)
    return await ctx.telegram.sendMessage(
      ctx.from!.id,
      `You must <b>log in using your your New Uzbekistan University email address</b>  <code>(@newuu.uz)</code>.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: `Try again`, url }]],
        },
        parse_mode: `HTML`,
      }
    );

  if (option == `external`)
    return await ctx.telegram.sendMessage(
      ctx.from!.id,
      `Welcome to the bot where you can become part of the university community.\n\nYou are lucky, log in with any gmail account.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Log In With Google`, url: `${url}&option=external` }],
          ],
        },
        parse_mode: `HTML`,
      }
    );

  return await ctx.telegram.sendMessage(
    ctx.from!.id,
    `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your your New Uzbekistan University email address</b>  <code>(@newuu.uz)</code>.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: `Log In With Google`, url: `${url}&option=${option}` }],
        ],
      },
      parse_mode: `HTML`,
    }
  );
};

export = login;
