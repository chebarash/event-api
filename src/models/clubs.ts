import { Schema, model } from "mongoose";
import { ClubType } from "../types/types";

const clubsSchema = new Schema<ClubType>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  channel: { type: String },
  cover: { type: String, required: true },
  fg: { type: String, required: true },
  bg: { type: String, required: true },
  hidden: { type: Boolean, required: true, default: false },
  leader: { type: Schema.Types.ObjectId, ref: `users`, required: true },
});

const Clubs = model<ClubType>(`clubs`, clubsSchema);

export default Clubs;
