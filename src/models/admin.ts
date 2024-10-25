import { Schema, model } from "mongoose";
import { AdminType } from "../types/types";

const adminsSchema = new Schema<AdminType>({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expires: { type: Date, required: true },
  calendarId: { type: String, required: true },
});

const Admins = model<AdminType>(`admins`, adminsSchema);

export default Admins;
