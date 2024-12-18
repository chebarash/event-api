import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { MyContext } from "../types/types";
import Clubs from "../models/clubs";

const getClubs = async (ctx: MyContext) => {
  const clubs = await Clubs.find({ hidden: false });

  const media = `AgACAgIAAxkBAAIqHmcIDx23OO0mps3c52_tAAEL1rXNxQAC2ekxGzp-QUgtKkxYQQ24CwEAAwIAA3cAAzYE`;
  const caption = `Clubs:`;
  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: clubs.map(({ _id, name }) => [
      { text: name, callback_data: `club//${_id}` },
    ]),
  };

  return ctx.callbackQuery
    ? await ctx.editMessageMedia(
        {
          type: `photo`,
          media,
          caption,
        },
        {
          reply_markup,
        }
      )
    : await ctx.replyWithPhoto(media, { caption, reply_markup });
};

export = getClubs;
