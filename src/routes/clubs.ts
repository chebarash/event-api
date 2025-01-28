import { RequestHandler } from "express";
import {
  ClubResponseType,
  ClubType,
  MethodsType,
  UserType,
} from "../types/types";
import Users from "../models/users";
import Clubs from "../models/clubs";
import Events from "../models/events";
import bot from "../bot";

let topClubs: Array<ClubResponseType>;
let validTime = 0;

const updateTopClubs = async () => {
  const clubs: Array<ClubResponseType> = await Clubs.find({ hidden: false })
    .populate(`leader`)
    .lean();

  const users = await Users.find({
    member: { $exists: true, $not: { $size: 0 } },
  }).lean();

  for (const club of clubs)
    club.members = users.filter((user) =>
      user.member.some((member) => `${member}` === `${club._id}`)
    );

  topClubs = clubs.sort((a, b) => b.members.length - a.members.length);
  validTime = Date.now() + 1000 * 60;
};

const clubs: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ query: { _id } }, res) => {
    if (!topClubs || Date.now() > validTime) await updateTopClubs();

    if (!_id) return res.json(topClubs);

    const index = topClubs.findIndex((club) => club._id.toString() === _id);

    let club: ClubResponseType;

    if (index === -1) {
      const c = await Clubs.findOne({ hidden: true, _id })
        .populate(`leader`)
        .lean();
      if (c)
        club = {
          ...c,
          members: await Users.find({ member: _id }).lean(),
        } as ClubResponseType;
      else return res.status(404).json({ message: `Club not found` });
    } else club = topClubs[index];

    const events = await Events.find({ author: _id })
      .sort({ date: -1 })
      .lean()
      .exec();

    const chat = await bot.telegram.getChat(club.leader.id);

    let username = `chebarash`;

    if (chat.type == `private` && chat.username) username = chat.username;

    res.json({ ...club, rank: index + 1, events, username });
  },
  post: async ({ body: { _id, userId }, user }, res) => {
    if (!user) return res.status(401).json({ message: `Login to join` });
    if (!_id) return res.status(400).json({ message: `Club not found` });
    const club = await Clubs.findOne({ _id });
    if (!club) return res.status(404).json({ message: `Club not found` });
    if (`${club.leader}` === `${user._id}` && userId) {
      await Users.findByIdAndUpdate(userId, { $pull: { member: _id } });
      await updateTopClubs();
      const index = topClubs.findIndex((club) => club._id.toString() === _id);
      const events = await Events.find({ author: _id })
        .sort({ date: -1 })
        .lean()
        .exec();
      return res.json({
        ...topClubs[index],
        rank: index + 1,
        events,
      });
    }
    if (!user.email.endsWith(`@newuu.uz`))
      return res.status(403).json({ message: `Only students can join` });
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
  put: async ({ body, user }, res) => {
    if (!user) return res.status(401).json({ message: `Login to join` });
    if (!body._id) return res.status(400).json({ message: `Club not found` });
    const club = await Clubs.findOne({ _id: body._id });
    if (!club) return res.status(404).json({ message: `Club not found` });
    if (`${club.leader}` !== `${user._id}`)
      return res.status(403).json({ message: `Not a leader` });
    await club.updateOne({
      description: body.description,
      channel: body.channel,
      cover: body.cover,
      fg: body.fg,
      bg: body.bg,
    });
    if (!topClubs || Date.now() > validTime) await updateTopClubs();
    const index = topClubs.findIndex(
      (club) => club._id.toString() === body._id
    );

    const events = await Events.find({ author: body._id })
      .sort({ date: -1 })
      .lean()
      .exec();
    res.json({
      ...(await Clubs.findById(club._id).populate(`leader`).lean()),
      rank: index + 1,
      events,
    });
  },
};

export = clubs;
