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
      data: { id_token, access_token, refresh_token, expires_in },
    } = await axios.post<{
      id_token: string;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>(`https://oauth2.googleapis.com/token`, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: `authorization_code`,
    });

    const {
      data: { email, picture, given_name, family_name },
    } = await axios.get<{
      email: string;
      picture: string;
      given_name: string;
      family_name: string;
    }>(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);

    const {
      data: { id: calendarId },
    } = await axios.post<{ id: string }>(
      "https://www.googleapis.com/calendar/v3/calendars",
      {
        summary: "Event",
        description:
          "Post events, register and be part of the university community.",
        timeZone: "Asia/Tashkent",
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
        accessToken: access_token,
        refreshToken: refresh_token,
        calendarId,
        expires: new Date(Date.now() + expires_in * 1000),
      },
      { upsert: true }
    );
    return res.redirect(`https://t.me/pueventbot?start=${option}`);
  },
};

export = callback;
