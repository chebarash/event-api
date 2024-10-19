import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Registrations from "../models/registrations";

const registration: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async ({ user, query: { _id, registered } }, res) => {
    if (!user) return res.json([]);
    if (_id)
      if (registered)
        await Registrations.deleteOne({ user: user._id, event: _id });
      else {
        if (!(await Registrations.findOne({ user: user._id, event: _id })))
          await new Registrations({
            user: user._id,
            event: _id,
          }).save();
      }
    return res.json(
      (await Registrations.find({ user: user._id })).map((r) => r.event)
    );
  },
};

export = registration;
