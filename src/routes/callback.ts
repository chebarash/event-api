import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
import Users from "../models/users";
import axios from "axios";

const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_SECRET } =
  process.env;

const callback: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: async (req, res) => {
    const { code, state } = req.query;

    const {
      data: { id_token },
    } = await axios.post<{ id_token: string }>(
      `https://oauth2.googleapis.com/token`,
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: `authorization_code`,
      }
    );

    const {
      data: { email, picture, given_name, family_name },
    } = await axios.get<{
      email: string;
      picture: string;
      given_name: string;
      family_name: string;
    }>(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);

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
    return res.redirect(`https://t.me/pueventbot?start=${option}`);
  },
};

export = callback;
