import { RequestHandler } from "express";
import { EventType, MethodsType } from "../types/types";
import Events from "../models/events";
import bot from "../bot";
import axios from "axios";

const def = {
  spots: undefined,
  deadline: undefined,
  external: undefined,
  content: undefined,
  template: undefined,
  button: undefined,
  voting: undefined,
};

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { gte, lte, _id } }, res) => {
    const date: { $gte?: Date; $lte?: Date } = {};
    if (gte) date[`$gte`] = new Date(gte as string);
    if (lte) date[`$lte`] = new Date(lte as string);
    if (_id)
      return res.json(
        await Events.findById(_id)
          .populate([`author`, `registered`, `participated`])
          .lean()
          .exec()
      );
    res.json(
      await Events.find({ date })
        .sort({ date: 1 })
        .populate([`author`, `registered`, `participated`])
        .lean()
        .exec()
    );
  },
  post: async ({ user, admin, body }, res) => {
    try {
      if (!user?.clubs.length)
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
      const event = await (
        await new Events(body).save()
      ).populate([`author`, `registered`, `participated`]);
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
    if (!user?.clubs.length)
      return res.status(500).json({ message: `You are not organizer` });
    const e = await Events.findById(body._id).exec();
    if (!e) return res.status(500).json({ message: `Event not found` });
    if (
      !user.clubs
        .map(({ _id }: { _id: string }) => `${_id}`)
        .includes(`${e.author}`)
    )
      return res.status(403).json({ message: "Forbidden" });
    const { notification, ...data } = body;
    const event: EventType = { ...def, ...data };
    for (const key in event) (e as any)[key] = event[key as keyof EventType];
    await e.save();
    await e.populate([`author`, `registered`, `participated`]);
    res.json(e);
    if (e?.eventId) {
      const startTime = new Date(e.date);
      const endTime = new Date(startTime.getTime() + (e.duration || 0));
      await axios.put<{ id: string }>(
        `https://www.googleapis.com/calendar/v3/calendars/${admin.calendarId}/events/${e.eventId}`,
        {
          summary: e.title,
          location: e.venue,
          description: e.description,
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
          attendees: e.registered.map(({ email }) => ({ email })),
          guestsCanInviteOthers: false,
          guestsCanSeeOtherGuests: false,
          status: e.cancelled ? `cancelled` : `confirmed`,
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
