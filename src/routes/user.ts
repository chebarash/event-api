import { RequestHandler } from "express";
import { MethodsType } from "../types/types";

const user: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user }, res) => {
    if (!user) return res.status(500).json({ message: `User not found` });
    return res.json(user);
  },
};

export = user;
