import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Registrations from "../models/registrations";

const registration: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, query: { _id, registered } }, res) => {
    if (!user) return res.status(500).json({ message: `User not found` });
    if (!_id) return res.status(500).json({ message: `_id not found` });
    if (registered)
      await Registrations.deleteOne({ user: user._id, event: _id });
    else {
      if (!(await Registrations.findOne({ user: user._id, event: _id })))
        await new Registrations({ user: user._id, event: _id }).save();
    }
    return res.json({ registered: !registered });
  },
};

export = registration;
