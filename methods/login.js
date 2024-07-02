const { GOOGLE_AUTH_URL } = process.env;

const login = (ctx) =>
  ctx.reply(
    `Welcome to the bot where you can become part of the university community.\nTo continue, you must <b>log in using your student email</b>.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: `Log In With Google`, url: GOOGLE_AUTH_URL }],
        ],
      },
      parse_mode: `HTML`,
    }
  );

module.exports = login;
