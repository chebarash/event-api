var ObjectId = require(`mongodb`).ObjectId;
const users = require(`../models/user`);

const userRoute = async ({ query: { _id } }, res) => {
  if (!_id) return res.status(500).json({ message: `_id is required` });
  return res.json(await users.findOne(new ObjectId(_id)));
};

module.exports = userRoute;
