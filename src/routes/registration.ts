import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";

const registration: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, query: { _id, registered } }, res) => {
    if (!user) return res.json([]);
    if (_id)
      await Events.updateOne(
        { _id },
        registered
          ? { $pull: { participants: user._id } }
          : { $push: { participants: user._id } }
      );
    return res.json(await Events.findOne({ _id }).populate(`author`).exec());
  },
};

export = registration;
