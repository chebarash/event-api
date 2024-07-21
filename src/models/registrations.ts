import { Schema, model } from "mongoose";
import { RegistrationType } from "../types/types";

const registrationSchema = new Schema<RegistrationType>({
  user: { type: Schema.Types.ObjectId, ref: "users", required: true },
  event: { type: Schema.Types.ObjectId, ref: "events", required: true },
  date: { type: Date, default: Date.now },
  participated: { type: Date },
  rate: { type: Number },
  comment: { type: String },
});

registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registrations = model<RegistrationType>(
  "registrations",
  registrationSchema
);

export default Registrations;
