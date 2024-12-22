import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";
import bot from "../bot";

const participants: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { _id }, user }, res) => {
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const event = await Events.findOne({ _id }).populate("participants");
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (
      ![
        ...user.clubs.map((club: { _id: string }) => `${club._id}`),
        `${user._id}`,
      ].includes(`${event.author}`)
    )
      return res.status(403).json({ message: "Forbidden" });
    await bot.telegram.sendMessage(
      user.id,
      `<b>Participants of the event ${event.title}:</b>\n${event.participants
        .map(
          ({ name, email, id }, i) =>
            `<b>${i + 1}.</b> <code>${id}</code> ${name} (${email})`
        )
        .join("\n")}`,
      { parse_mode: "HTML" }
    );
    return res.json({ ok: true });
  },
};

export = participants;
