import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events, { getEvents } from "../models/events";
import bot from "../bot";
import axios from "axios";

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (_, res) => {
    res.json(await getEvents());
  },
  post: async ({ user, body }, res) => {
    try {
      if (!user?.organizer && !user?.clubs.length)
        return res.status(500).json({ message: `You are not organizer` });
      const startTime = new Date(body.date);
      const endTime = new Date(startTime.getTime() + body.duration);
      const {
        data: { id },
      } = await axios.post<{ id: string }>(
        `https://www.googleapis.com/calendar/v3/calendars/${user.calendarId}/events`,
        {
          summary: body.title,
          location: body.venue,
          description: body.description,
          start: {
            dateTime: startTime.toISOString(),
          },
          end: {
            dateTime: endTime.toISOString(),
          },
          attendees: [],
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      body.eventId = id;
      body.calendarId = user.calendarId;
      const event = await (await new Events(body).save()).populate(`author`);
      await bot.telegram.sendMessage(
        process.env.ADMIN_ID,
        `New Event by ${event.author.name}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: event.title,
                  url: `https://t.me/pueventbot/event?startapp=${event._id}`,
                },
                { text: `delete`, callback_data: `delete//${event._id}` },
              ],
            ],
          },
        }
      );
      res.json(event);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Wrong data` });
    }
  },
};

export = event;
