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
import { message } from "telegraf/filters";

const { GOOGLE_AUTH_URL, TOKEN, GROUP, ADMIN_ID } = process.env;

const bot = new Telegraf<MyContext>(TOKEN);

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    await error(ctx, e);
  }
});

bot.on(message(`new_chat_members`), async (ctx) => {
  if (!GROUP.includes(`${ctx.chat.id}`)) await ctx.leaveChat();
});

const accept = async (ctx: MyContext) => {
  await ctx.telegram.approveChatJoinRequest(GROUP, ctx.user.id);
  try {
    await ctx.telegram.sendMessage(ADMIN_ID, `Join group`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.user.name,
              url: `tg://user?id=${ctx.user.id}`,
            },
          ],
        ],
      },
    });
  } catch (e: any) {
    await ctx.telegram.sendMessage(ADMIN_ID, `Join group`);
  }
  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `<pre><code class="language-json">${JSON.stringify(
      ctx.user,
      null,
      2
    )}</code></pre>`,
    { parse_mode: `HTML` }
  );
};

bot.on(`chat_join_request`, async (ctx) => {
  const { id, first_name } = ctx.update.chat_join_request.from;
  const res = await Users.findOne({ id });
  if (!res)
    return await ctx.telegram.sendMessage(
      id,
      `Welcome to the bot where you can become part of the university community.\n\nTo continue, you must <b>log in using your student email</b>.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Log In With Google`,
                url: `${GOOGLE_AUTH_URL}?id=${ctx.from?.id}&option=join`,
              },
            ],
          ],
        },
        parse_mode: `HTML`,
      }
    );
  ctx.user = res;
  await accept(ctx);
});

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
  if (ctx.chat?.type != `private`) return;
  await log(ctx);
  const { id } = ctx.from;
  const option = ctx.message.text.split(` `)[1];

  const res = await Users.findOne({ id });
  if (!res) return await login(ctx, option);
  ctx.user = res;

  if (option === `clubs`) return await getClubs(ctx);
  if (option === `join`) return await accept(ctx);

  if (option?.startsWith(`clb-`)) {
    const username = option.replace(`clb-`, ``);
    return await getClub(ctx, { username });
  }

  return await start(ctx);
});

bot.on(`chosen_inline_result`, result);
bot.on(`inline_query`, inline);

bot.use(async (ctx, next) => {
  if (ctx.chat?.type != `private`) return;
  if (ctx.from) {
    const { id } = ctx.from;

    const res = await Users.findOne({ id });
    if (!res) return await login(ctx);
    ctx.user = res;
  }

  await next();
  await log(ctx);
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
