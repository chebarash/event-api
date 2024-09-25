import { Telegraf } from "telegraf";
import { MyContext, UserType } from "./types/types";
import log from "./methods/log";
import newuser from "./methods/newuser";
import login from "./methods/login";
import start from "./methods/start";
import error from "./methods/error";
import inline from "./methods/inline";
import Users from "./models/users";
import { tempMethod } from "./methods/temp";
import temp from "./temp";
import Clubs from "./models/clubs";

const bot = new Telegraf<MyContext>(process.env.TOKEN);

bot.start(async (ctx) => {
  try {
    await log(ctx);
    const { id } = ctx.from;
    const tempId = ctx.message.text.split(` `)[1];

    if (tempId) {
      if (tempId.startsWith(`clb-`)) {
        const username = tempId.replace(`clb-`, ``);
        const club = await Clubs.findOne({ username });

        if (club) {
          ctx.user = (await Users.findOne({ id })) as UserType;
          if (!ctx.user) return await login(ctx);

          if (ctx.user.clubs.includes(username)) {
            return await ctx.replyWithPhoto(club.cover, {
              caption: `You are already registered for the <b>${
                club.name
              }</b> club.\n\n${club.description}\n\n${club.links
                .map(({ url, text }) => `<a href="${url}">${text}</a>`)
                .join(` | `)}`,
              parse_mode: `HTML`,
            });
          } else {
            ctx.user.clubs.push(username);
            await ctx.user.save();
            return await ctx.replyWithPhoto(club.cover, {
              caption: `Welcome to the ${club.name} club!\n\n${
                club.description
              }\n\n${club.links
                .map(({ url, text }) => `<a href="${url}">${text}</a>`)
                .join(` | `)}`,
              parse_mode: `HTML`,
            });
          }
        }
        return await ctx.reply("Club not found.");
      }

      if (temp[tempId]) await newuser(id, tempId);
    }

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
