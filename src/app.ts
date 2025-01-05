import { RequestHandler, Router } from "express";
import { MethodsType } from "./types/types";

import notification from "./routes/notification";
import participated from "./routes/participated";
import registered from "./routes/registered";
import callback from "./routes/callback";
import event from "./routes/event";
import photo from "./routes/photo";
import clubs from "./routes/clubs";
import auth from "./routes/auth";
import user from "./routes/user";
import vote from "./routes/vote";
import index from "./routes";

const appRouter = Router();

const routes: Array<
  [
    string,
    {
      [name in MethodsType]?: RequestHandler;
    }
  ]
> = [
  [`/`, index],
  [`/user`, user],
  [`/auth`, auth],
  [`/vote`, vote],
  [`/clubs`, clubs],
  [`/event`, event],
  [`/callback`, callback],
  [`/photo/:fileId`, photo],
  [`/registered`, registered],
  [`/participated`, participated],
  [`/notification`, notification],
];

for (const [route, methods] of routes) {
  for (const method in methods) {
    const handler = methods[method as MethodsType] as RequestHandler;
    appRouter[method as MethodsType](route, async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (e) {
        console.log(e);
        return res.status(500).json({ message: `something went wrong` });
      }
    });
  }
}

export = appRouter;
