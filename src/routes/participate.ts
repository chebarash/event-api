import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Registrations from "../models/registrations";

const participate: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, query: { _id } }, res) => {
    if (!user) return res.status(500).json({ message: `User not found` });
    if (!_id) return res.status(500).json({ message: `_id not found` });
    return res.json({
      registration: await Registrations.findOneAndUpdate(
        { event: _id },
        { participated: Date.now() },
        { new: true }
      ),
    });
  },
};

export = participate;
