import { Schema, model } from "mongoose";
import { UserType } from "../types/types";

const usersSchema = new Schema<UserType>({
  given_name: { type: String, required: true },
  family_name: { type: String, required: true },
  picture: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: Number, required: true, unique: true },
  organizer: { type: Boolean, default: false },
});

const Users = model<UserType>(`users`, usersSchema);

export default Users;
