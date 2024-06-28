const users = require("../models/user");

const userRoute = async ({ query: { _id } }, res) =>
  res.send(await users.find({ _id }).toArray());

module.exports = userRoute;
