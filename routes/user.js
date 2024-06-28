const users = require("../models/user");

const userRoute = async ({ query: { _id } }, res) =>
  res.json(await users.findOne({ _id }));

module.exports = userRoute;
