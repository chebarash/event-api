import { Document, ObjectId } from "mongoose";
import { Context } from "telegraf";

export type AdminType = {
  accessToken: string;
  refreshToken: string;
  expires: Date;
  calendarId: string;
} & Document;

export type ClubType = {
  _id: ObjectId;
  username: string;
  name: string;
  description: string;
  links: Array<{ url: string; text: string }>;
  cover: string;
  hidden: boolean;
  leader: UserType;
} & Document;

export type UserType = {
  _id: ObjectId;
  name: string;
  picture?: string;
  email: string;
  id: number;
  member: Array<ClubType>;
  clubs: Array<ClubType>;
  phone?: string;
  joined: boolean;
} & Document;

export type ContentType = { type: `video` | `photo`; fileId: string };

export type EventType = {
  _id: ObjectId;
  title: string;
  picture: string;
  color: string;
  description: string;
  author: ClubType;
  date: Date;
  venue: string;
  duration: number;
  shares: number;
  private: boolean;
  registered: Array<UserType>;
  participated: Array<UserType>;
  hashtags: Array<string>;
  eventId: string;
  notification: {
    pre: boolean;
    post: boolean;
  };
  spots?: number;
  deadline?: Date;
  external?: string;
  content?: ContentType;
  template?: string;
  button?: string;
  cancelled: boolean;
  voting?: {
    title: string;
    options: Array<string>;
    votes: Array<{ user: UserType; option: string }>;
  };
} & Document;

export type MethodsType =
  | `all`
  | `get`
  | `post`
  | `put`
  | `delete`
  | `patch`
  | `options`
  | `head`;

export interface MyContext extends Context {
  user: UserType;
}
