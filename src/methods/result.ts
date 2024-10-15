import { NarrowedContext } from "telegraf";
import Events from "../models/events";
import { MyContext } from "../types/types";
import { Update } from "telegraf/typings/core/types/typegram";
import error from "./error";

const result = async (
  ctx: NarrowedContext<MyContext, Update.ChosenInlineResultUpdate>
) => {
  try {
    const event = await Events.findOne({
      _id: ctx.chosenInlineResult.result_id,
    });
    if (!event) return;
    event.shares++;
    await event.save();
  } catch (e) {
    await error(ctx, e);
  }
};

export = result;
