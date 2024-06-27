const { GOOGLE_AUTH_URL } = process.env;

const login = (ctx) =>
  ctx.reply(`Log In`, {
    reply_markup: {
      inline_keyboard: [[{ text: `log in`, url: GOOGLE_AUTH_URL }]],
    },
  });

module.exports = login;
