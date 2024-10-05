import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Users from "../models/users";

const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } =
  process.env;

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
      const {
        given_name,
        family_name,
        picture,
        email,
      }: { [name: string]: string } = await token_info_response.json();
      const { id, option }: { [name: string]: string } =
        typeof state == `string` ? JSON.parse(state) : {};
      await Users.updateOne(
        { email },
        {
          name: [given_name, family_name]
            .map((v) =>
              v.toLowerCase().replace(/\b(\w)/g, (x) => x.toUpperCase())
            )
            .join(` `),
          picture,
          email,
          id,
        },
        { upsert: true }
      );
      return res.redirect(`https://t.me/pueventbot?start=${option}`);
    }

    res.status(token_info_response.status).json({ error: true });
  },
};

export = callback;
