import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import axios from "axios";

const participated: {
  [name in MethodsType]?: RequestHandler;
} = {
  post: async ({ user, admin, body: { _id } }, res) => {
    if (!user) return res.json([]);
    if (!_id) return res.json([]);
    const event = await Events.findOneAndUpdate(
      { _id },
      { $addToSet: { participated: user._id } },
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

export = participated;
