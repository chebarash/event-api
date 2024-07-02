const events = require("../models/event");

const inline = async (ctx) => {
  const offset = parseInt(ctx.inlineQuery.offset) || 0;
  const data = await events.getEvent({
    title: { $regex: ctx.inlineQuery.query, $options: "i" },
  });

  let results = data
    .slice(offset, offset + 10)
    .map(
      ({ _id, title, picture, description, date, venue, duration, author }) => {
        const d = new Date(date);
        return {
          type: `photo`,
          id: _id,
          photo_url: picture,
          thumbnail_url: picture,
          description: title,
          caption: `<b>${title}⚡️</b>\n\n${description}\n\n<b>📍 Venue:</b> ${venue}\n<b>🗓 Date:</b> ${
            d.toLocaleDateString(`en`, { month: `long`, timeZone: `Etc/UTC` }) +
            ` ` +
            d.getDate()
          }\n<b>⏱ Time:</b> ${d.toLocaleString(`en`, {
            timeStyle: `short`,
            timeZone: `Etc/UTC`,
          })}`,
          parse_mode: `HTML`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Open in Event`,
                  url: `https://t.me/pueventbot/event?startapp=${_id}`,
                },
              ],
            ],
          },
        };
      }
    );

  return await ctx.answerInlineQuery(results, {
    is_personal: true,
    next_offset: offset + results.length,
    cache_time: 10,
  });
};

module.exports = inline;
