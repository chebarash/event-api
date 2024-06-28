require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const cors = require(`cors`);

const start = require(`./methods/start`);
const error = require(`./methods/error`);
const login = require(`./methods/login`);
const newuser = require(`./methods/newuser`);
const log = require(`./methods/log`);

const authRoute = require(`./routes/auth`);
const callbackRoute = require(`./routes/callback`);
const eventRoute = require(`./routes/event`);
const userRoute = require(`./routes/user`);

const MyContext = require(`./context`);

const users = require(`./models/user`);

const { TOKEN, VERCEL_URL, PORT } = process.env;

const bot = new Telegraf(TOKEN, { contextType: MyContext });
const app = express();

bot.start(async (ctx) => {
  try {
    await log(ctx);
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
app.get(`/auth`, authRoute);
app.get(`/google/callback`, callbackRoute);
app.get(`/event`, eventRoute);
app.get(`/user`, userRoute);

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
