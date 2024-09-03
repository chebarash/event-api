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

const isContentType = (obj: any): obj is ContentType =>
  obj &&
  (obj.type === "video" || obj.type === "photo") &&
  typeof obj.fileId === "string";

const isUserType = (obj: any): obj is UserType =>
  obj &&
  typeof obj.given_name === "string" &&
  typeof obj.family_name === "string" &&
  typeof obj.picture === "string" &&
  typeof obj.email === "string" &&
  typeof obj.id === "number" &&
  typeof obj.organizer === "boolean";

const isEventType = (obj: any): obj is EventType =>
  obj &&
  typeof obj.title === "string" &&
  typeof obj.picture === "string" &&
  typeof obj.description === "string" &&
  Array.isArray(obj.authors) &&
  obj.authors.every(isUserType) &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(obj.date) &&
  typeof obj.venue === "string" &&
  typeof obj.duration === "number" &&
  (obj.content === undefined || isContentType(obj.content)) &&
  (obj.template === undefined || typeof obj.template === "string") &&
  (obj.button === undefined || typeof obj.button === "string");

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
    if (!user?.organizer)
      return res.status(500).json({ message: `You are not organizer` });
    if (!isEventType(body))
      return res.status(500).json({ message: `Wrong data` });
    const event = await (await new Events(body).save()).populate(`authors`);
    await bot.telegram.sendMessage(
      process.env.ADMIN_ID,
      `New Event by ${[
        event.authors[0].given_name,
        event.authors[0].family_name,
      ]
        .map((v) => v.toLowerCase().replace(/\b(\w)/g, (x) => x.toUpperCase()))
        .join(` `)}`,
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
  },
};

export = event;
