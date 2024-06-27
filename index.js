require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const cors = require("cors");
const start = require("./methods/start");
const error = require("./methods/error");
const auth = require("./routes/auth");
const callback = require("./routes/callback");
const users = require("./models/user");
const login = require("./methods/login");
const MyContext = require("./context");
const newuser = require("./methods/newuser");
const log = require("./methods/log");

const { TOKEN, VERCEL_URL, PORT } = process.env;

const bot = new Telegraf(TOKEN, { contextType: MyContext });
const app = express();

bot.start(async (ctx) => {
  try {
    const { id } = ctx.from;
    const tempId = ctx.message.text.split(` `)[1];
    if (tempId) await newuser(id, tempId);
    ctx.user = await users.findOne({ id });
    if (!ctx.user) return await login(ctx);
    return await start(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.use(async (ctx, next) => {
  try {
    const { id } = ctx.from;

    ctx.user = await users.findOne({ id });
    if (!ctx.user) return await login(ctx);

    await next();
    await log(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

app.use(cors());
app.get("/auth", auth);
app.get("/google/callback", callback);

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
