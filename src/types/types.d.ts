import { Document, ObjectId } from "mongoose";
import { Context } from "telegraf";

export type ClubType = {
  username: string;
  name: string;
  description: string;
  links: Array<{ url: string; text: string }>;
  cover: string;
} & Document;

export type RegistrationType = {
  user: UserType;
  event: EventType;
  date: Date;
  participated?: Date;
  rate?: number;
  comment?: string;
} & Document;

export type UserType = {
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  id: number;
  organizer: boolean;
  clubs: Array<string>;
} & Document;

export type ContentType = { type: `video` | `photo`; fileId: string };

export type EventType = {
  title: string;
  picture: string;
  description: string;
  authors: Array<UserType>;
  date: Date;
  venue: string;
  duration: number;
  content?: ContentType;
  template?: string;
  button?: string;
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
