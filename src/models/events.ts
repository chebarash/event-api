import { Schema, model } from "mongoose";
import { EventType } from "../types/types";

const eventSchema = new Schema<EventType>({
  title: { type: String, required: true },
  picture: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: `clubs`, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  duration: { type: Number, required: true },
  content: {
    type: { type: String, enum: [`video`, `photo`] },
    fileId: { type: String },
  },
  template: { type: String },
  button: { type: String },
  shares: { type: Number, default: 0 },
  private: { type: Boolean, required: true, default: false },
  eventId: { type: String, required: true },
  notification: {
    pre: { type: Boolean, default: false },
    post: { type: Boolean, default: false },
  },
  external: { type: String },
  registered: [{ type: Schema.Types.ObjectId, ref: `users`, default: [] }],
  participated: [{ type: Schema.Types.ObjectId, ref: `users`, default: [] }],
  spots: { type: Number },
  deadline: { type: Date },
  hashtags: [{ type: String, default: [] }],
  cancelled: { type: Boolean, default: false },
});

const Events = model<EventType>(`events`, eventSchema);

export default Events;
