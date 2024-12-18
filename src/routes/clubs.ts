import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Users from "../models/users";
import Clubs from "../models/clubs";

const clubs: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (req, res) => {
    const clubs = await Clubs.find({ hidden: false });

    const clubList = await Promise.all(
      clubs.map(async (club) => {
        const membersCount = await Users.countDocuments({
          member: club._id,
        });
        return { name: club.name, members: membersCount };
      })
    );

    res.json(clubList.sort((a, b) => b.members - a.members));
  },
};

export = clubs;
