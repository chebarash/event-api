import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Registrations from "../models/registrations";
import Events from "../models/events";

const participants: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, query: { _id } }, res) => {
    if (!_id) return res.status(500).json({ message: `_id not found` });
    if (!user || (!user.organizer && !user.clubs?.length)) return res.json([]);
    const event = await Events.findOne({ _id });
    if (!event) return res.status(500).json({ message: `Event not found` });
    if (
      `${event.author._id}` != `${user._id}` &&
      !user.organizer &&
      !user.clubs.some(
        ({ _id }: { _id: string }) => `${_id}` == `${event.author._id}`
      )
    )
      return res.json([]);
    return res.json(
      (await Registrations.find({ event: _id }).populate(`user`)).map(
        (r) => r.user
      )
    );
  },
};

export = participants;
