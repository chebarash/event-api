import { MyContext } from "../types/types";
import action from "./action";

const left = async (ctx: MyContext) => {
  ctx.user.joined = false;
  await ctx.user.save();
  return await action(ctx);
};

export = left;
