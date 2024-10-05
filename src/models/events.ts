import { Schema, model } from "mongoose";
import { EventType } from "../types/types";

const eventSchema = new Schema<EventType>({
  title: { type: String, required: true },
  picture: { type: String, required: true },
  description: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    refPath: "authorModel",
    required: true,
  },
  authorModel: { type: String, enum: [`users`, `clubs`], required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  duration: { type: Number, required: true },
  content: {
    type: { type: String, enum: [`video`, `photo`] },
    fileId: { type: String },
  },
  template: { type: String },
  button: { type: String },
});

const Events = model<EventType>(`events`, eventSchema);

export const getEvents = (match = {}): Promise<Array<EventType>> => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return Events.find({ ...match, date: { $gte: date } })
    .sort({ date: 1 })
    .populate(`author`)
    .lean()
    .exec();
};

export default Events;
