import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { MyContext } from "./types/types";

import Users from "./models/users";
import Clubs from "./models/clubs";

import { tempMethod } from "./methods/temp";
import phoneNumber from "./methods/phone";
import contact from "./methods/contact";
import accept from "./methods/accept";
import inline from "./methods/inline";
import result from "./methods/result";
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
