import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";

const participated: {
  [name in MethodsType]?: RequestHandler;
} = {
  post: async ({ user, body: { _id, participant } }, res) => {
    if (!user || !user || !participant)
      return res.status(401).json({ message: "Unauthorized" });
    const event = await Events.findOneAndUpdate(
      { _id },
      { $addToSet: { participated: participant } },
      { new: true, useFindAndModify: false }
    )
      .populate([`author`, `registered`, `participated`])
      .exec();
    res.json(event);
  },
};

export = participated;
