require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const axios = require("axios");
const cors = require("cors");

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

const adminId = parseInt(ADMIN_ID);

bot.command(`test`, async (ctx) => {
  await ctx.reply(
    `https://myservice.example.com/auth?client_id=GOOGLE_CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE_STRING&response_type=token&user_locale=LOCALE`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `test`,
              url: `https://myservice.example.com/auth?client_id=GOOGLE_CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE_STRING&response_type=token&user_locale=LOCALE`,
            },
          ],
        ],
      },
    }
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

app.post("/auth", async (req, res) => {
  try {
    const code = req.headers.authorization;
    console.log("Authorization Code:", code);

    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      redirect_uri: "postmessage",
      grant_type: "authorization_code",
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      // redirect_uris: "https://event.chebarash.uz",
    });
    const accessToken = response.data.access_token;
    console.log("Access Token:", accessToken);

    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const userDetails = userResponse.data;
    console.log("User Details:", userDetails);

    res.status(200).json({ message: "Authentication successful" });
  } catch (error) {
    console.error("Error saving code:", error);
    res.status(500).json({ message: "Failed to save code" });
  }
});

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
