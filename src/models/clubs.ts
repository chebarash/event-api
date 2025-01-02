import { Schema, model } from "mongoose";
import { ClubType } from "../types/types";

const clubsSchema = new Schema<ClubType>({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  links: { type: [{ url: String, text: String }], required: true, default: [] },
  cover: { type: String, required: true },
  hidden: { type: Boolean, required: true, default: false },
  leader: { type: Schema.Types.ObjectId, ref: `users`, required: true },
});

const Clubs = model<ClubType>(`clubs`, clubsSchema);

export default Clubs;
