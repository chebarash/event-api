import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import bot from "../bot";
import axios from "axios";

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { gte, lte } }, res) => {
    const date: { $gte?: Date; $lte?: Date } = {};
    if (gte) date[`$gte`] = new Date(gte as string);
    if (lte) date[`$lte`] = new Date(lte as string);
    res.json(
      await Events.find({ date })
        .sort({ date: 1 })
        .populate(`author`)
        .lean()
        .exec()
    );
  },
  post: async ({ user, admin, body }, res) => {
    try {
      if (!user?.organizer && !user?.clubs.length)
        return res.status(500).json({ message: `You are not organizer` });
      const startTime = new Date(body.date);
      const endTime = new Date(startTime.getTime() + body.duration);
      const {
        data: { id },
      } = await axios.post<{ id: string }>(
        `https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events`,
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
          reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 30 }],
          },
          attendees: [],
          guestsCanInviteOthers: false,
          guestsCanSeeOtherGuests: false,
        },
        {
          headers: {
            Authorization: `Bearer ${admin.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      body.eventId = id;
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
  put: async ({ user, admin, body }, res) => {
    if (!user?.organizer && !user?.clubs.length)
      return res.status(500).json({ message: `You are not organizer` });
    const e = await Events.findById(body._id).exec();
    if (!e) return res.status(500).json({ message: `Event not found` });
    if (
      ![
        ...user.clubs.map((club: { _id: string }) => `${club._id}`),
        `${user._id}`,
      ].includes(`${e.author}`)
    )
      return res.status(403).json({ message: "Forbidden" });
    const event = await Events.findByIdAndUpdate(body._id, body, {
      new: true,
      useFindAndModify: false,
    })
      .populate(`author`)
      .exec();
    res.json(e);
    if (event?.eventId) {
      const startTime = new Date(event.date);
      const endTime = new Date(startTime.getTime() + (event.duration || 0));
      await axios.put<{ id: string }>(
        `https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events/${event.eventId}`,
        {
          summary: event.title,
          location: event.venue,
          description: event.description,
          start: {
            dateTime: startTime.toISOString(),
          },
          end: {
            dateTime: endTime.toISOString(),
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 30 }],
          },
          attendees: event.participants.map(({ email }) => ({ email })),
          guestsCanInviteOthers: false,
          guestsCanSeeOtherGuests: false,
          status: event.cancelled ? `cancelled` : `confirmed`,
        },
        {
          headers: {
            Authorization: `Bearer ${admin.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};

export = event;
