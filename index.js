require(`dotenv`).config();
const { Telegraf } = require(`telegraf`);
const express = require(`express`);
const cors = require(`cors`);

const start = require(`./methods/start`);
const error = require(`./methods/error`);
const login = require(`./methods/login`);
const newuser = require(`./methods/newuser`);
const log = require(`./methods/log`);
const inline = require("./methods/inline");

const authRoute = require(`./routes/auth`);
const callbackRoute = require(`./routes/callback`);
const eventRoute = require(`./routes/event`);
const userRoute = require(`./routes/user`);

const MyContext = require(`./context`);

const users = require(`./models/user`);

//temp
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Register = new Schema({
  user: { type: ObjectId, ref: "users", required: true },
  event: { type: ObjectId, ref: "events", required: true },
  date: { type: Date, default: Date.now },
  rate: { type: Number },
  comment: { type: String },
});

const RegisterModel = mongoose.model("registration", Register);

mongoose.connect(process.env.MONGODB).then(() => {
  console.log("Connected!");
});

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

bot.on(`inline_query`, inline);

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
  } catch (e) {
    res.status(500).json({ error: true });
    console.log(e);
  }
};

app.use(cors());
app.use(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization)
      req.user = await users.findOne({ id: parseInt(authorization) });
    return next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: `Something went wrong.` });
  }
});
app.get(`/auth`, handle(authRoute));
app.get(`/google/callback`, handle(callbackRoute));
app.get(`/event`, handle(eventRoute));
app.get(`/user`, handle(userRoute));
app.get(`/register`, async ({ user, query: { _id } }, res) => {
  if (!user) return res.status(500).json({ message: `User not found` });
  if (!_id) return res.status(500).json({ message: `_id not found` });
  return res.json(
    await new RegisterModel({ user: user._id, event: _id }).save()
  );
});

(async () => {
  app.use(await bot.createWebhook({ domain: VERCEL_URL }));
  app.listen(PORT, () => console.log(`Listening on port`, PORT));
})();

module.exports = app;
