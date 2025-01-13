import "dotenv/config";
import express from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import { connect } from "mongoose";

import Users from "./models/users";
import Admins from "./models/admin";

import appRouter from "./app";
import bot from "./bot";

import media from "./routes/media";

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
  DEV,
  GROUP,
  LOGS,
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
    GROUP,
    LOGS,
  ].some((v) => !v)
) {
  console.error(`Environment Variables not set`);
  process.exit(1);
}

const app = express();
const port = PORT || 3000;

app.use(cors());
app.use(express.json());

app.post(`/${TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));

app.get(`/photo/:fileId`, media(`photo`));
app.get(`/video/:fileId`, media(`video`));

const getId = (initData: string): null | number => {
  const data = new URLSearchParams(initData);
  const hash = data.get("hash");
  const dataToCheck: string[] = [];

  data.sort();
  data.forEach(
    (val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`)
  );
  const user = data.get(`user`);

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(TOKEN)
    .digest();

  const _hash = crypto
    .createHmac("sha256", secret)
    .update(dataToCheck.join("\n"))
    .digest("hex");

  return hash === _hash && user ? JSON.parse(user).id : null;
};

app.use(async (req, res, next) => {
  try {
    const admin = await Admins.findOne();
    if (!admin) return res.status(500).json({ message: `Admin not found` });
    if (admin.expires < new Date()) {
      const {
        data: { access_token, expires_in },
      } = await axios.post<{
        access_token: string;
        expires_in: number;
      }>("https://oauth2.googleapis.com/token", {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: admin.refreshToken,
        grant_type: "refresh_token",
      });
      admin.accessToken = access_token;
      admin.expires = new Date(Date.now() + expires_in * 1000);
      await admin.save();
    }
    req.admin = admin;

    const { authorization } = req.headers;

    if (authorization?.startsWith(`tma `)) {
      const initData = authorization.replace(`tma `, ``);
      const id = getId(initData);
      if (!id) return res.status(401).json({ message: `Unauthorized` });
      const user = await Users.findOne({ id }).populate([`clubs`, `member`]);
      if (user) req.user = user;
    }

    return next();
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: `Something went wrong.` });
  }
}, appRouter);

connect(DATABASE_URL)
  .then(async () => {
    console.log(`Connected to MongoDB`);
    DEV
      ? bot.launch()
      : await bot.telegram.setWebhook(`${VERCEL_URL}/${TOKEN}`);
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
  });

export = app;
