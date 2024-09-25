import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connect } from "mongoose";

import Users from "./models/users";

import appRouter from "./app";
import bot from "./bot";
import { Server } from "socket.io";
import Clubs from "./models/clubs";

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
  PROD_URL,
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
    PROD_URL,
    VERCEL_URL,
  ].some((v) => !v)
) {
  console.error(`Environment Variables not set`);
  process.exit(1);
}

const app = express();
const port = PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket",
  cors: {
    origin: PROD_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.post(`/${TOKEN}`, (req, res) => bot.handleUpdate(req.body, res));

const emitClubList = async () => {
  try {
    const clubs = await Clubs.find();

    const clubList = await Promise.all(
      clubs.map(async (club) => {
        const membersCount = await Users.countDocuments({
          clubs: club.username,
        });
        return { name: club.name, members: membersCount };
      })
    );

    const sortedClubList = clubList.sort((a, b) => b.members - a.members);

    io.emit("clubListUpdate", sortedClubList);
  } catch (error) {
    console.error("Error emitting club list:", error);
  }
};

setInterval(emitClubList, 10000);

io.on("connection", (socket) => {
  console.log("A client connected");
  emitClubList();

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

app.use(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) req.user = await Users.findOne({ id: authorization });
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
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB:`, error);
  });

export = server;
