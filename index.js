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
const events = require("./models/event");

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

bot.on("inline_query", async (ctx) => {
  const offset = parseInt(ctx.inlineQuery.offset) || 0;
  const data = await events
    .aggregate([
      {
        $lookup: {
          from: `users`,
          localField: `author`,
          foreignField: `_id`,
          as: `author`,
        },
      },
      {
        $project: {
          title: 1,
          picture: 1,
          description: 1,
          date: 1,
          venue: 1,
          duration: 1,
          author: { $arrayElemAt: [`$author`, 0] },
        },
      },
    ])
    .toArray();

  let results = data
    .slice(offset, offset + 10)
    .map(
      ({
        _id,
        title,
        picture,
        description,
        date,
        venue,
        duration,
        author,
      }) => ({
        type: `photo`,
        id: _id,
        photo_url: picture,
        thumbnail_url: picture,
        description: title,
        caption: "*" + title + "*\n" + description,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `event`,
                url: `https://t.me/pueventbot/event?startapp=${_id}`,
              },
            ],
          ],
        },
      })
    );

  return await ctx.answerInlineQuery(results, {
    is_personal: true,
    next_offset: offset + results.length,
    cache_time: 10,
  });
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

const handle = (next) => async (req, res) => {
  try {
    await next(req, res);
  } catch (e) {}
};

app.use(cors());
app.get(`/auth`, handle(authRoute));
app.get(`/google/callback`, handle(callbackRoute));
app.get(`/event`, handle(eventRoute));
app.get(`/user`, handle(userRoute));

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
