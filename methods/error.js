const { ADMIN_ID } = process.env;

const adminId = parseInt(ADMIN_ID);

const error = async (ctx, e) => {
  console.log(e);
  await ctx.telegram.sendMessage(
    adminId,
    `<pre><code class="language-json">${JSON.stringify(
      { message: e.message, ...e, update: ctx.update },
      null,
      2
    )}</code></pre>`,
    { parse_mode: `HTML` }
  );
};

module.exports = error;