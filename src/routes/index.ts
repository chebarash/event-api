import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Users from "../models/users";
import Clubs from "../models/clubs";
import Events from "../models/events";

const index: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (_, res) => {
    const users = await Users.countDocuments();
    const clubs = await Clubs.countDocuments({ hidden: false });
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const events = await Events.find({ date: { $gte: date } })
      .sort({ date: 1 })
      .populate([`author`, `registered`, `participated`])
      .lean()
      .exec();
    const foryou = {
      title: `Chimgan Winter Trip`,
      subtitle: `by Travel Club`,
      button: `Get Ticket`,
      image: `http://event-api.chebarash.uz/photo/AgACAgIAAxkBAAJAAmd0MXNLcZKhUzOELJz-YHhCvqlpAALS5TEb2MmgS46omyRRxvrEAQADAgADeQADNgQ`,
      link: `/events/6763c2141438c4cd016b4c60`,
    };
    res.json({ users, clubs, events, foryou });
  },
};

export = index;
