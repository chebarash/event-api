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
    const events = await Events.countDocuments();
    res.json({ users, clubs, events });
  },
};

export = index;
