import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { MyContext } from "../types/types";
import Clubs from "../models/clubs";

const getClub = async (ctx: MyContext, query: { [name: string]: any } = {}) => {
  const club = await Clubs.findOne(query);

  if (!club) return await ctx.answerCbQuery(`Club not found.`);

  const caption = `<b>${club.name}</b>\n\n${club.description}\n\n${club.links
    .map(({ url, text }) => `<a href="${url}">${text}</a>`)
    .join(` | `)}`;

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        {
          text: ctx.user.member.map((_id) => `${_id}`).includes(`${club._id}`)
            ? `Leave`
            : `Join`,
          callback_data: `clb//${club._id}`,
        },
      ],
      [{ text: `All Clubs`, callback_data: `clubs` }],
    ],
  };

  return ctx.callbackQuery
    ? await ctx.editMessageMedia(
        {
          type: `photo`,
          media: club.cover,
          caption,
          parse_mode: `HTML`,
        },
        { reply_markup }
      )
    : await ctx.replyWithPhoto(club.cover, {
        caption,
        parse_mode: `HTML`,
        reply_markup,
      });
};

export = getClub;
