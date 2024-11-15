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
} & Document;

export type UserType = {
  _id: ObjectId;
  name: string;
  picture?: string;
  email: string;
  id: number;
  organizer: boolean;
  member: Array<ClubType>;
  clubs: Array<ClubType>;
} & Document;

export type ContentType = { type: `video` | `photo`; fileId: string };

export type EventType = {
  _id: ObjectId;
  title: string;
  picture: string;
  description: string;
  author: UserType | ClubType;
  authorModel: `users` | `clubs`;
  date: Date;
  venue: string;
  duration: number;
  shares: number;
  private: boolean;
  participants: Array<UserType>;
  hashtags: Array<string>;
  eventId: string;
  spots?: number;
  deadline?: Date;
  external?: string;
  content?: ContentType;
  template?: string;
  button?: string;
  cancelled: boolean;
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
