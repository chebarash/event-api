import { RequestHandler } from "express";
declare const media: (type: `photo` | `video`) => RequestHandler;
export = media;
