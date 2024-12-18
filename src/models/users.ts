import { Schema, model } from "mongoose";
import { UserType } from "../types/types";

const usersSchema = new Schema<UserType>({
  name: { type: String, required: true },
  picture: { type: String },
  email: { type: String, required: true, unique: true },
  id: { type: Number, required: true, unique: true },
  organizer: { type: Boolean, default: false },
  member: [{ type: Schema.Types.ObjectId, ref: `clubs` }],
  clubs: [{ type: Schema.Types.ObjectId, ref: `clubs`, default: [] }],
  phone: { type: String },
  joined: { type: Boolean, default: false, required: true },
});

const Users = model<UserType>(`users`, usersSchema);

export default Users;
