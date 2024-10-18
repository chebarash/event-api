import "dotenv/config";
import express from "express";
import cors from "cors";
import { connect } from "mongoose";

import Users, { getUser } from "./models/users";

import appRouter from "./app";
import bot from "./bot";
import Clubs from "./models/clubs";
import Events from "./models/events";

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

app.get(`/clubs`, async (req, res) => {
  try {
    const clubs = await Clubs.find({ hidden: false });

    const clubList = await Promise.all(
      clubs.map(async (club) => {
        const membersCount = await Users.countDocuments({
          member: club._id,
        });
        return { name: club.name, members: membersCount };
      })
    );

    res.json(clubList.sort((a, b) => b.members - a.members));
  } catch (error) {
    res.status(500).json([]);
    console.error("Error emitting club list:", error);
  }
});

app.use(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) req.user = await getUser({ id: authorization });
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
