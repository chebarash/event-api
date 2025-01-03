import { RequestHandler } from "express";
import { MethodsType } from "../types/types";

const user: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user }, res) => {
    if (!user) return res.status(401).json({ message: `Login to register` });
    return res.json(user);
  },
};

export = user;
