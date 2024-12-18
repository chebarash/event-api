import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { MyContext } from "./types/types";

import Users from "./models/users";
import Clubs from "./models/clubs";

import { tempMethod } from "./methods/temp";
import phoneNumber from "./methods/phone";
import contact from "./methods/contact";
import getClubs from "./methods/clubs";
import accept from "./methods/accept";
import inline from "./methods/inline";
import result from "./methods/result";
import getClub from "./methods/club";
import login from "./methods/login";
import start from "./methods/start";
import error from "./methods/error";
import left from "./methods/left";
import log from "./methods/log";

const { TOKEN, GROUP, LOGS } = process.env;

const bot = new Telegraf<MyContext>(TOKEN);

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    await error(ctx, e);
  }
});

bot.on(message(`new_chat_members`), async (ctx) => {
  if (![GROUP, LOGS].includes(`${ctx.chat.id}`)) await ctx.leaveChat();
});

bot.start(async (ctx) => {
  if (ctx.chat?.type != `private`) return;
  await log(ctx);
  const { id } = ctx.from;
  const option = ctx.message.text.split(` `)[1];

  const res = await Users.findOne({ id });
  if (!res) return await login(ctx, option);
  ctx.user = res;
  if (!ctx.user.phone) return await phoneNumber(ctx);

  if (option === `clubs`) return await getClubs(ctx);

  if (option?.startsWith(`clb-`)) {
    const username = option.replace(`clb-`, ``);
    return await getClub(ctx, { username });
  }
  await accept(ctx);
  return await start(ctx);
});

bot.on(`contact`, contact);
bot.on(`chosen_inline_result`, result);
bot.on(`inline_query`, inline);

bot.use(async (ctx, next) => {
  if (ctx.from) {
    if (ctx.from.is_bot) return;
    const { id } = (ctx.update as any).message?.left_chat_member || ctx.from;
    const res = await Users.findOne({ id });
    if (!res) return await login(ctx);
    ctx.user = res;

    if (!ctx.user.phone) return await phoneNumber(ctx);
  }

  await next();
  if (ctx.chat && ctx.chat.type == `private`) await log(ctx);
});

bot.on(`chat_join_request`, accept);
bot.on(message(`left_chat_member`), left);

bot.use(async (ctx, next) => {
  if (ctx.chat?.type != `private`) return;
  await next();
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
  const clubs = (await Clubs.find({}))
    .map(({ username }) => `https://t.me/pueventbot?start=clb-${username}`)
    .join(`\n`);
  await ctx.reply(`Clubs:\n${clubs}`);
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
