import { MyContext } from "../types/types";
import action from "./action";

const { GROUP } = process.env;

const accept = async (ctx: MyContext) => {
  try {
    await ctx.telegram.approveChatJoinRequest(GROUP, ctx.user.id);
    ctx.user.joined = true;
    await ctx.user.save();
    return await action(ctx);
  } catch (e) {
    console.error(e);
  }
};

export = accept;
