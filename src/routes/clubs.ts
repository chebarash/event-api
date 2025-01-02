import { RequestHandler } from "express";
import { MethodsType, UserType } from "../types/types";
import Users from "../models/users";
import Clubs from "../models/clubs";
import Events from "../models/events";

const clubs: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { _id } }, res) => {
    const clubs = await Clubs.find().populate(`leader`).lean();

    const clubList = await Promise.all(
      clubs.map(async (club) => ({
        ...club,
        members: await Users.countDocuments({
          member: club._id,
        }),
      }))
    );

    const topClubs = clubList.sort((a, b) => b.members - a.members);
    if (!_id) return res.json(topClubs);

    const index = topClubs.findIndex((club) => club._id.toString() === _id);

    if (index === -1)
      return res.status(404).json({ message: `Club not found` });

    const events = await Events.find({ author: _id }).lean();

    res.json({ ...topClubs[index], rank: index + 1, events });
  },
  post: async ({ body: { _id }, user }, res) => {
    if (!user) return res.status(401).json({ message: `Login to join` });
    if (!_id) return res.status(400).json({ message: `Club not found` });
    const club = await Clubs.findOne({ _id });
    if (!club) return res.status(404).json({ message: `Club not found` });
    const isMember = (user as UserType).member.some(
      (club) => `${club._id}` === _id
    );
    await user.updateOne(
      isMember ? { $pull: { member: _id } } : { $addToSet: { member: _id } }
    );
    res.json(
      await Users.findById(user._id).populate([`clubs`, `member`]).lean()
    );
  },
};

export = clubs;
