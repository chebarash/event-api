import { Schema, model } from "mongoose";
import { UserExtendedType, UserType } from "../types/types";
import Clubs from "./clubs";

const usersSchema = new Schema<UserType>({
  name: { type: String, required: true },
  picture: { type: String },
  email: { type: String, required: true, unique: true },
  id: { type: Number, required: true, unique: true },
  organizer: { type: Boolean, default: false },
  member: [{ type: Schema.Types.ObjectId, ref: `clubs` }],
});

const Users = model<UserType>(`users`, usersSchema);

export const getUser = async (match = {}): Promise<UserExtendedType | null> => {
  const user = (await Users.findOne(match).lean()) as UserExtendedType;

  if (!user) return null;

  user.clubs = await Clubs.find({ coordinators: user._id }).lean();

  return user;
};

export default Users;
