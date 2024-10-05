import { MyContext } from "../types/types";

const start = (ctx: MyContext) =>
  ctx.reply(
    `<b>Hey ${ctx.user.name}</b>, check out what interesting events there are today.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Open Event`,
              web_app: { url: `https://event.chebarash.uz` },
            },
          ],
        ],
      },
      parse_mode: `HTML`,
    }
  );

export = start;
