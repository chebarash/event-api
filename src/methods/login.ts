import { MyContext } from "../types/types";

const { GOOGLE_AUTH_URL } = process.env;

const login = (ctx: MyContext, option?: string) =>
  ctx.telegram.sendMessage(
    ctx.from!.id,
    `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your your New Uzbekistan University email address</b>  <code>(@newuu.uz)</code>.\n\n<b>Need Help?</b> Contact <a href="https://t.me/m/_mZ-DLfsNzZi">@chebarash</a>`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Log In With Google`,
              url: `${GOOGLE_AUTH_URL}?id=${ctx.from?.id}&option=${option}`,
            },
          ],
        ],
      },
      parse_mode: `HTML`,
    }
  );

export = login;
