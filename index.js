require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const {
  ADMIN_ID,
  TOKEN,
  VERCEL_URL,
  PORT,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
} = process.env;

const bot = new Telegraf(TOKEN);
const app = express();

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

const adminId = parseInt(ADMIN_ID);

bot.command(`test`, async (ctx) => {
  await ctx.reply(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${`https://event.chebarash.uz/api/auth/callback/google`}&state=STATE_STRING&response_type=code`
  );
});

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

app.use(cors());

app.post("/auth/login", async (req, res) => {
  console.log(req.headers.authorization);
  const tokenId = req.headers.authorization;
  const ticket = await client.verifyIdToken({
    idToken: tokenId.slice(7),
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  console.log(payload);
  if (payload.aud != process.env.GOOGLE_CLIENT_ID)
    return res.send("Unauthorised");
  const { email, name } = payload;
  const authToken = jwt.sign({ email, name }, process.env.SECRET);

  res.json({ authToken });
});

app.post("/access", async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const decoded = jwt.verify(authToken.slice(7), process.env.SECRET);
  } catch (e) {
    return res.json({ data: "NOT Authorised" });
  }
  res.json({ data: "Authorised" });
});

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
