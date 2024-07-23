"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const events_1 = require("../models/events");
const loadTemplate = (template = `*{{title}}*\n\n{{description}}\n\n*Venue:* {{venue}}\n*Date:* {{date}}\n*Time:* {{time}}`, variables) => {
    Object.entries(variables).forEach(([name, value]) => {
        template = template.replace(new RegExp(`{{${name}}}`, "g"), value.replace(/\-/g, `\\-`).replace(/\./g, `\\.`));
    });
    return template;
};
const inline = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = parseInt(ctx.inlineQuery.offset) || 0;
    const data = yield (0, events_1.getEvents)({
        title: { $regex: ctx.inlineQuery.query, $options: "i" },
    });
    let results = data
        .slice(offset, offset + 10)
        .map(({ _id, title, picture, description, date, venue, duration, authors, template, content, button, }) => {
        const d = new Date(date);
        const hours = duration / (1000 * 60 * 60);
        return {
            type: `photo`,
            id: `${_id}`,
            photo_url: picture,
            thumbnail_url: picture,
            description: title,
            caption: loadTemplate(template, {
                title,
                description,
                date: d.toLocaleDateString(`en`, {
                    month: `long`,
                    timeZone: `Asia/Tashkent`,
                }) +
                    ` ` +
                    d.toLocaleDateString(`en`, {
                        day: `numeric`,
                        timeZone: `Asia/Tashkent`,
                    }),
                time: d.toLocaleString(`en`, {
                    timeStyle: `short`,
                    timeZone: `Asia/Tashkent`,
                }),
                venue,
                duration: `${hours} ${hours == 1 ? `hour` : `hours`}`,
                author: authors[0].given_name
                    .toLowerCase()
                    .replace(/\b(\w)/g, (x) => x.toUpperCase()),
            }),
            parse_mode: `MarkdownV2`,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: button || `Open in Event`,
                            url: `https://t.me/pueventbot/event?startapp=${_id}`,
                        },
                    ],
                ],
            },
        };
    });
    return yield ctx.answerInlineQuery(results, {
        is_personal: true,
        next_offset: `${offset + results.length}`,
        cache_time: 10,
    });
});
module.exports = inline;
