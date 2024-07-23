import { ObjectId } from "mongoose";
import { Context } from "telegraf";

export type RegistrationType = {
  _id: ObjectId;
  user: UserType;
  event: EventType;
  date: Date;
  participated?: Date;
  rate?: number;
  comment?: string;
};

export type UserType = {
  _id: ObjectId;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  id: number;
};

export type EventType = {
  _id: ObjectId;
  title: string;
  picture: string;
  description: string;
  authors: Array<UserType>;
  date: Date;
  venue: string;
  duration: number;
  content?: { type: `video` | `photo`; fileId: string };
  template?: string;
  button?: string;
};

export type MethodsType =
  | "all"
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

export interface MyContext extends Context {
  user: UserType;
}
