import { ExtraPhoto } from "telegraf/typings/telegram-types";
import { MyContext } from "../types/types";

const { LOGS } = process.env;

const action = async (ctx: MyContext) => {
  const { id, email, name, phone, joined, picture } = ctx.user;
  const extra: ExtraPhoto = {
    caption: `<pre><code class="language-json">${JSON.stringify(
      { id, email, name, phone, joined },
      null,
      2
    )}</code></pre>`,
    parse_mode: `HTML`,
  };
  const log = ctx.telegram.sendPhoto.bind(ctx.telegram, LOGS, {
    url: picture || `https://event.chebarash.uz/profile.png`,
  });
  try {
    await log({
      ...extra,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: (ctx.from as any).first_name,
              url: `tg://user?id=${ctx.user.id}`,
            },
          ],
        ],
      },
    });
  } catch (e: any) {
    await log(extra);
  }
};

export = action;
