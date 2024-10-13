import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Users from "../models/users";
import bot from "../bot";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_SECRET,
  ADMIN_ID,
} = process.env;

const adminId = parseInt(ADMIN_ID);

const callback: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (req, res) => {
    const { code, state } = req.query;

    const response = await fetch(`https://oauth2.googleapis.com/token`, {
      method: `POST`,
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: `authorization_code`,
      }),
    });

    const { id_token } = await response.json();

    const token_info_response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
    );

    if (token_info_response.status == 200) {
      const tokenInfo = await token_info_response.json();
      const {
        given_name,
        family_name,
        picture,
        email,
      }: { [name: string]: string } = tokenInfo;
      const { id, option }: { [name: string]: string } =
        typeof state == `string` ? JSON.parse(state) : {};
      await Users.updateOne(
        { email },
        {
          name: [given_name, family_name]
            .map(
              (v) => v.charAt(0).toUpperCase() + v.slice(1).toLocaleLowerCase()
            )
            .join(` `),
          picture,
          email,
          id,
        },
        { upsert: true }
      );
      await bot.telegram.sendMessage(
        adminId,
        `<pre><code class="language-json">${JSON.stringify(
          {
            ...tokenInfo,
            id,
          },
          null,
          2
        )}</code></pre>`,
        { parse_mode: `HTML` }
      );
      return res.redirect(`https://t.me/pueventbot?start=${option}`);
    }

    res.status(token_info_response.status).json({ error: true });
  },
};

export = callback;
