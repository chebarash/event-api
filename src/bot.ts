import { Telegraf } from "telegraf";
import { MyContext } from "./types/types";
import log from "./methods/log";
import login from "./methods/login";
import start from "./methods/start";
import error from "./methods/error";
import inline from "./methods/inline";
import result from "./methods/result";
import Users from "./models/users";
import { tempMethod } from "./methods/temp";
import Clubs from "./models/clubs";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

const bot = new Telegraf<MyContext>(process.env.TOKEN);

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

bot.start(async (ctx) => {
  try {
    await log(ctx);
    const { id } = ctx.from;
    const option = ctx.message.text.split(` `)[1];

    const res = await Users.findOne({ id });
    if (!res) return await login(ctx, option);
    ctx.user = res;

    if (option === `clubs`) return await getClubs(ctx);

    if (option?.startsWith(`clb-`)) {
      const username = option.replace(`clb-`, ``);
      return await getClub(ctx, { username });
    }

    return await start(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.on(`chosen_inline_result`, result);
bot.on(`inline_query`, inline);

bot.use(async (ctx, next) => {
  try {
    if (ctx.from) {
      const { id } = ctx.from;

      const res = await Users.findOne({ id });
      if (!res) return await login(ctx);
      ctx.user = res;
    }

    await next();
    await log(ctx);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.action(/^clb/g, async (ctx) => {
  const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
  const club = await Clubs.findOne({ _id });
  if (!club) return await ctx.answerCbQuery(`Club not found.`);
  const includes = ctx.user.member.map((_id) => `${_id}`).includes(_id);
  await ctx.user.updateOne(
    includes ? { $pull: { member: _id } } : { $addToSet: { member: _id } }
  );
  await ctx.answerCbQuery(
    includes ? `You left the club.` : `You joined the club.`
  );
  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [{ text: includes ? `Join` : `Leave`, callback_data: `clb//${_id}` }],
      [{ text: `All Clubs`, callback_data: `clubs` }],
    ],
  });
});

bot.command(`clubs`, getClubs);
bot.action(`clubs`, getClubs);

bot.action(/^club/g, async (ctx) => {
  const _id = (ctx.callbackQuery as { data: string }).data.split(`//`)[1];
  getClub(ctx, { _id });
});

bot.command(`clb`, async (ctx) => {
  try {
    const clubs = (await Clubs.find({}))
      .map(({ username }) => `https://t.me/pueventbot?start=clb-${username}`)
      .join(`\n`);
    await ctx.reply(`Clubs:\n${clubs}`);
  } catch (e) {
    await error(ctx, e);
  }
});

bot.command(`whoami`, (ctx) =>
  ctx.reply(
    `<pre><code class="language-json">${JSON.stringify(
      ctx.user,
      null,
      2
    )}</code></pre>`,
    { parse_mode: `HTML` }
  )
);

tempMethod(bot);

export = bot;
