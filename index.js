require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const cors = require("cors");
const { MongoClient } = require("mongodb");

const {
  ADMIN_ID,
  TOKEN,
  VERCEL_URL,
  PORT,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL,
  GOOGLE_AUTH_URL,
  MONGODB,
} = process.env;

const bot = new Telegraf(TOKEN);
const app = express();

const adminId = parseInt(ADMIN_ID);

const temp = {};

const client = new MongoClient(MONGODB);
const database = client.db("test");
const users = database.collection("users");

bot.use(async (ctx, next) => {
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
    next();
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

bot.start(async (ctx) => {
  const tempId = ctx.message.text.split(` `)[1];
  if (tempId) {
    temp[tempId].id = ctx.chat.id;
    await users.insertOne(temp[tempId]);
    return ctx.reply(`welcome`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `event`, web_app: { url: `https://event.chebarash.uz` } }],
        ],
      },
    });
  }

  await ctx.reply(`Log In`, {
    reply_markup: {
      inline_keyboard: [[{ text: `log in`, url: GOOGLE_AUTH_URL }]],
    },
  });
});

app.use(cors());

app.get("/auth", async (req, res) =>
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      GOOGLE_CALLBACK_URL
    )}&access_type=offline&response_type=code&state=api&scope=openid%20email%20profile`
  )
);

app.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  const response = await fetch(`https://oauth2.googleapis.com/token`, {
    method: "POST",
    body: JSON.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  const { id_token } = await response.json();

  const token_info_response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
  );

  if (token_info_response.status == 200) {
    const tempId = (Math.random() + 1).toString(36).substring(7);
    const { given_name, family_name, picture, email } =
      await token_info_response.json();
    temp[tempId] = { given_name, family_name, picture, email };
    return res.redirect(`https://t.me/pueventbot?start=${tempId}`);
  }

  res.status(token_info_response.status).json({ error: true });
});

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
