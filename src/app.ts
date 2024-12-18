import { RequestHandler, Router } from "express";
import { MethodsType } from "./types/types";

import participants from "./routes/participants";
import registration from "./routes/registration";
import callback from "./routes/callback";
import event from "./routes/event";
import photo from "./routes/photo";
import clubs from "./routes/clubs";
import auth from "./routes/auth";
import user from "./routes/user";
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
  [`/auth`, auth],
  [`/clubs`, clubs],
  [`/callback`, callback],
  [`/event`, event],
  [`/registration`, registration],
  [`/user`, user],
  [`/photo/:fileId`, photo],
  [`/participants`, participants],
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
