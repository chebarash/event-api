import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Events from "../models/events";

const vote: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { _id, option }, user }, res) => {
    if (!option || typeof option != `string`)
      return res.status(400).json({ message: "Option is required" });
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const event = await Events.findOne({ _id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.voting)
      return res
        .status(400)
        .json({ message: "Voting is not enabled for this event" });
    const votes = event.voting.votes.filter(
      (vote) => `${vote.user}` != `${user._id}`
    );
    votes.push({ user, option });
    const r = await Events.findOneAndUpdate(
      { _id },
      { $set: { "voting.votes": votes } },
      { new: true, useFindAndModify: false }
    )
      .populate([`author`, `registered`, `participated`])
      .exec();
    return res.json(r);
  },
};

export = vote;
