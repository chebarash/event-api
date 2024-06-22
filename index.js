require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);

const { ADMIN_ID, TOKEN, VERCEL_URL, PORT } = process.env;

const bot = new Telegraf(TOKEN);
const app = express();

const adminId = parseInt(ADMIN_ID);

bot.use(async (ctx) => {
  try {
    try {
      const { username, first_name, id } = ctx.from;
      await ctx.copyMessage(adminId, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: username || first_name,
                url: `tg://user?id=${id}`,
              },
            ],
          ],
        },
      });
    } catch (e) {
      await ctx.copyMessage(adminId);
      if (e.message != `400: Bad Request: BUTTON_USER_PRIVACY_RESTRICTED`)
        await bot.telegram.sendMessage(
          adminId,
          `<pre><code class="language-json">${JSON.stringify(
            { message: e.message, ...e, update: ctx.update },
            null,
            2
          )}</code></pre>`,
          { parse_mode: `HTML` }
        );
    }
  } catch (e) {
    console.log(e);
    await bot.telegram.sendMessage(
      adminId,
      `<pre><code class="language-json">${JSON.stringify(
        { message: e.message, ...e, update: ctx.update },
        null,
        2
      )}</code></pre>`,
      { parse_mode: `HTML` }
    );
  }
});

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
