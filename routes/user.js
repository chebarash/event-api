const users = require(`../models/user`);

const userRoute = async ({ headers: { authorization } }, res) => {
  if (!authorization)
    return res.status(500).json({ message: `User not found` });
  const user = await users.findOne({ id: parseInt(authorization) });
  if (!user) return res.status(500).json({ message: `User not found` });
  return res.json(user);
};

module.exports = userRoute;
