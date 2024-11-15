import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import axios from "axios";

const registration: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, admin, query: { _id, registered } }, res) => {
    if (!user) return res.json([]);
    if (!_id) return res.json([]);
    const event = await Events.findOneAndUpdate(
      { _id },
      registered
        ? { $pull: { participants: user._id } }
        : { $addToSet: { participants: user._id } },
      { new: true, useFindAndModify: false }
    )
      .populate([`author`, `participants`])
      .exec();
    res.json({
      ...event?.toObject(),
      participants: event?.populated(`participants`),
    });
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

export = registration;
