import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import bot from "../bot";
import axios from "axios";

const registered: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { _id }, user }, res) => {
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const event = await Events.findOne({ _id }).populate("registered");
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (
      !user.clubs
        .map(({ _id }: { _id: string }) => `${_id}`)
        .includes(`${event.author}`)
    )
      return res.status(403).json({ message: "Forbidden" });

    const file = event.registered.map(({ name, email, id }) => ({
      name,
      email,
      id,
    }));

    await bot.telegram.sendDocument(
      user.id,
      {
        source: Buffer.from(JSON.stringify(file, null, 2)),
        filename: `${event.title}.json`,
      },
      { caption: `Registered to ${event.title}` }
    );
    return res.json({ ok: true });
  },
  post: async ({ user, admin, body: { _id, userId, registered } }, res) => {
    if (!user) return res.json([]);
    if (!_id) return res.json([]);
    const event = await Events.findOneAndUpdate(
      { _id },
      registered || userId
        ? { $pull: { registered: userId || user._id } }
        : { $addToSet: { registered: user._id } },
      { new: true, useFindAndModify: false }
    )
      .populate([`author`, `registered`, `participated`])
      .exec();
    res.json(event);
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
          attendees: event.registered.map(({ email }) => ({ email })),
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

export = registered;
