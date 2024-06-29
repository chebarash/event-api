const users = require(`../models/user`);

const userRoute = async ({ query: { id } }, res) => {
  if (!id) return res.status(500).json({ message: `id is required` });
  return res.json(await users.findOne({ id: parseInt(id) }));
};

module.exports = userRoute;
