const { Schema, model } = require("mongoose");

const User = new Schema({
  given_name: { type: String, required: true },
  family_name: { type: String, required: true },
  picture: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: Number, required: true, unique: true },
});

module.exports = model("user", User);
