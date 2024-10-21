import { Document, ObjectId } from "mongoose";
import { Context } from "telegraf";

export type ClubType = {
  _id: ObjectId;
  username: string;
  name: string;
  description: string;
  links: Array<{ url: string; text: string }>;
  cover: string;
  coordinators: Array<UserType>;
  hidden: boolean;
} & Document;

export type UserExtendedType = UserType & {
  clubs: Array<ClubType>;
};

export type UserType = {
  _id: ObjectId;
  name: string;
  picture?: string;
  email: string;
  id: number;
  organizer: boolean;
  member: Array<ClubType>;
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
  content?: ContentType;
  template?: string;
  button?: string;
  private: boolean;
  external?: string;
  participants: Array<UserType>;
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
  user: UserExtendedType;
}
