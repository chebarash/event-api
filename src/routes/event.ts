import { RequestHandler } from "express";
import { EventType, MethodsType, RegistrationType } from "../types/types";
import { getEvents } from "../models/events";
import Registrations from "../models/registrations";

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user }, res) => {
    const events: Array<EventType & { registration?: RegistrationType }> =
      await getEvents();

    if (user) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const registrations = await Registrations.find({
        user: user._id,
        date: { $gte: date },
      })
        .populate([`user`, `event`])
        .exec();

      if (registrations)
        for (const registration of registrations) {
          const event = events.findIndex(
            ({ _id }) => `${_id}` == `${registration.event._id}`
          );
          if (event > -1) events[event].registration = registration;
        }
    }

    res.json(events);
  },
};

export = event;
