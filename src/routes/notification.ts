import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import bot from "../bot";

const notification: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (req, res) => {
    const currentTime = new Date();
    const time30 = new Date(currentTime.getTime() + 30 * 60 * 1000);
    const preEvent = await Events.find({
      date: { $lte: time30 },
      cancelled: false,
      "notification.pre": false,
    }).populate(`registered`);
    const postEvent = await Events.find({
      date: { $lte: currentTime },
      cancelled: false,
      "notification.post": false,
    }).populate({
      path: `author`,
      populate: {
        path: `leader`,
      },
    });
    let sent = false;
    for (const event of preEvent) {
      for (const { id } of event.registered) {
        try {
          await bot.telegram.sendPhoto(id, event.picture, {
            caption: `Just 30 minutes until <b>${event.title}</b> kicks off`,
            parse_mode: `HTML`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Ticket`,
                    web_app: {
                      url: `https://event.chebarash.uz/events/${event._id}/ticket`,
                    },
                  },
                ],
              ],
            },
          });
        } catch (e) {
          console.log(e);
        }
      }
      event.notification.pre = true;
      await event.save();
      sent = true;
    }
    for (const event of postEvent) {
      const eventEndTime = new Date(event.date);
      eventEndTime.setTime(eventEndTime.getTime() + event.duration);

      if (eventEndTime <= new Date()) {
        try {
          const link = {
            "entry.203470451": event._id,
            "entry.30472541": event.author.name,
            "entry.1777031597": event.date.toISOString().split("T")[0],
            "entry.297865307": event.title,
            "entry.1608372114": event.venue,
            "entry.919785868": event.registered.length,
            "entry.542587563": event.participated.length,
          };
          const linkString = Object.entries(link)
            .map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`)
            .join("&");
          await bot.telegram.sendMessage(
            event.author.leader.id,
            `Just a quick reminder to fill out the <a href="https://docs.google.com/forms/d/e/1FAIpQLSeuddmhm0Og2h2B8uHxBpEhbJrjKb4i-nzzIEEpwch0f02tAw/viewform?usp=pp_url&${linkString}">event report form</a> for <b>${event.title}</b>.`,
            {
              parse_mode: `HTML`,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `Open in Event`,
                      web_app: {
                        url: `https://event.chebarash.uz/events/${event._id}`,
                      },
                    },
                  ],
                ],
              },
            }
          );
        } catch (e) {
          console.log(e);
        }
        event.notification.post = true;
        await event.save();
        sent = true;
      }
    }

    res.status(200).json({
      success: true,
      message: sent ? `Notifications sent!` : `No events to notify.`,
    });
  },
};

export = notification;
