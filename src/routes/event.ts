import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import { getEvents } from "../models/events";

const event: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (_, res) => res.json(await getEvents()),
};

export = event;
