const start = (ctx) =>
  ctx.reply(`welcome`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `event`,
            web_app: { url: `https://event.chebarash.uz/${ctx.user._id}` },
          },
        ],
      ],
    },
  });

module.exports = start;
