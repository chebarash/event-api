import { Telegraf } from "telegraf";
import { MyContext, UserType } from "./types/types";
import log from "./methods/log";
import newuser from "./methods/newuser";
import login from "./methods/login";
import start from "./methods/start";
import error from "./methods/error";
import inline from "./methods/inline";
import Users from "./models/users";

const bot = new Telegraf<MyContext>(process.env.TOKEN);

bot.start(async (ctx) => {
  try {
    await log(ctx);
    const { id } = ctx.from;
    const tempId = ctx.message.text.split(` `)[1];
    if (tempId) await newuser(id, tempId);
    ctx.user = (await Users.findOne({ id })) as UserType;
    if (!ctx.user) return await login(ctx);
    return await start(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.on(`inline_query`, inline);

bot.use(async (ctx, next) => {
  try {
    if (ctx.from) {
      const { id } = ctx.from;

      ctx.user = (await Users.findOne({ id })) as UserType;
      if (!ctx.user) return await login(ctx);
    }

    await next();
    await log(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

export = bot;
