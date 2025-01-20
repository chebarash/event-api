import { Schema, model } from "mongoose";
import { ForYouType } from "../types/types";

const forYouSchema = new Schema<ForYouType>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  button: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
});

const ForYou = model<ForYouType>(`foryou`, forYouSchema);

export default ForYou;
