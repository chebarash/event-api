import { Context } from "telegraf";

const { GOOGLE_AUTH_URL } = process.env;

const login = (ctx: Context) =>
  ctx.reply(
    `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your student email</b>.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: `Log In With Google`, url: GOOGLE_AUTH_URL }],
        ],
      },
      parse_mode: `HTML`,
    }
  );

export = login;
