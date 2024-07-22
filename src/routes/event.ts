import { RequestHandler } from "express";
import { EventType, MethodsType } from "../types/types";
import { getEvents } from "../models/events";
import Registrations from "../models/registrations";
import { ObjectId } from "mongoose";

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user }, res) => {
    const events: Array<EventType & { registered?: boolean }> =
      await getEvents();

    if (user) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const registrations = await Registrations.find<{ event: ObjectId }>({
        user: user._id,
        date: { $gte: date },
      });

      if (registrations && registrations.length)
        for (let i = 0; i < events.length; i++)
          if (
            registrations.some(({ event }) => `${event}` == `${events[i]._id}`)
          )
            events[i].registered = true;
    }

    res.json(events);
  },
};

export = event;
