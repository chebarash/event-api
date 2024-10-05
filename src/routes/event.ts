import { RequestHandler } from "express";
import {
  ContentType,
  EventType,
  MethodsType,
  RegistrationType,
  UserType,
} from "../types/types";
import Events, { getEvents } from "../models/events";
import Registrations from "../models/registrations";
import bot from "../bot";

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
  post: async ({ user, body }, res) => {
    try {
      if (!user?.organizer && !user?.clubs.length)
        return res.status(500).json({ message: `You are not organizer` });
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
