import { RequestHandler, Router } from "express";
import { MethodsType } from "./types/types";

import auth from "./routes/auth";
import callback from "./routes/callback";
import event from "./routes/event";
import registration from "./routes/register";
import user from "./routes/user";

const appRouter = Router();

const routes: Array<
  [
    string,
    {
      [name in MethodsType]?: RequestHandler;
    }
  ]
> = [
  ["/auth", auth],
  ["/callback", callback],
  ["/event", event],
  ["/registration", registration],
  ["/user", user],
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