import express from "express";
import "dotenv/config";
import cors from "cors";
import { connect } from "mongoose";
import appRouter from "./app";
import Users from "./models/users";
import { MyContext, UserType } from "./types/types";
import { Telegraf } from "telegraf";

import error from "./methods/error";
import log from "./methods/log";
import newuser from "./methods/newuser";
import login from "./methods/login";
import start from "./methods/start";
import inline from "./methods/inline";
import Events from "./models/events";
import axios from "axios";

const {
  TOKEN,
  PORT,
  DATABASE_URL,
  ADMIN_ID,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_SECRET,
  VERCEL_URL,
} = process.env;

if (
  [
    TOKEN,
    PORT,
    DATABASE_URL,
    ADMIN_ID,
    GOOGLE_AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CALLBACK_URL,
    GOOGLE_CLIENT_SECRET,
    VERCEL_URL,
  ].find((v) => !v)
) {
  console.error(`Environment Variables not set`);
  process.exit(1);
}

const bot = new Telegraf<MyContext>(TOKEN);

const app = express();
const port = PORT || 3000;

bot.start(async (ctx) => {
  try {
    await log(ctx);
    const { id } = ctx.from;
    const tempId = ctx.message.text.split(` `)[1];
    if (tempId) await newuser(id, tempId);
    ctx.user = (await Users.findOne({ id })) as UserType;
    if (!ctx.user) return await login(ctx);
    return await start(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.on(`inline_query`, inline);

bot.use(async (ctx, next) => {
  try {
    if (ctx.from) {
      const { id } = ctx.from;

      ctx.user = (await Users.findOne({ id })) as UserType;
      if (!ctx.user) return await login(ctx);
    }

    await next();
    await log(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

app.use(cors());
app.use(express.json());

app.post(`/${TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));

app.get("/photo/:fileId", async (req, res) => {
  const fileId = req.params.fileId;

  if (!fileId) return res.status(400).send("File ID is required");

  try {
    const file = await bot.telegram.getFile(fileId);

    if (!file.file_path) return res.status(404).send("File not found");

    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    const response = await axios.get(fileUrl, { responseType: "stream" });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "image/jpeg"
    );
    res.setHeader("Content-Disposition", `inline; filename="photo.jpg"`);

    response.data.pipe(res);
  } catch (error) {
    res.status(500).send("Error fetching the file");
  }
});

app.use(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) req.user = await Users.findOne({ id: authorization });
    return next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: `Something went wrong.` });
  }
}, appRouter);

connect(DATABASE_URL)
  .then(async () => {
    console.log(`Connected to MongoDB`);
    await bot.telegram.setWebhook(`${VERCEL_URL}/${TOKEN}`);
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
  });

export = app;
