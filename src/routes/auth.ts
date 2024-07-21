import { RequestHandler } from "express";
import { MethodsType } from "../types/types";

const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;

const auth: {
  [name in MethodsType]?: RequestHandler;
} = {
  get: (_, res) =>
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        GOOGLE_CALLBACK_URL
      )}&access_type=offline&response_type=code&state=api&scope=openid%20email%20profile`
    ),
};

export = auth;
