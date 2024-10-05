import { MyContext } from "../types/types";

const { ADMIN_ID } = process.env;

const adminId = parseInt(ADMIN_ID);

const log = async (ctx: MyContext) => {
  if (!ctx.from || !ctx.message) return;
  const { id, first_name, username } = ctx.from;

  try {
    await ctx.copyMessage(adminId, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: username || first_name,
              url: `tg://user?id=${id}`,
            },
          ],
        ],
      },
    });
  } catch (e: any) {
    await ctx.copyMessage(adminId);
    if (e.message != `400: Bad Request: BUTTON_USER_PRIVACY_RESTRICTED`)
      await ctx.telegram.sendMessage(
        adminId,
        `<pre><code class="language-json">${JSON.stringify(
          { message: e.message, ...e, update: ctx.update },
          null,
          2
        )}</code></pre>`,
        { parse_mode: `HTML` }
      );
  }
};

export = log;
