var ObjectId = require(`mongodb`).ObjectId;

const users = require(`../models/user`);

const userRoute = async ({ query: { _id } }, res) =>
  res.json(await users.findOne(new ObjectId(_id)));

module.exports = userRoute;
