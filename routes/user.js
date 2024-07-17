const userRoute = async ({ user }, res) => {
  if (!user) return res.status(500).json({ message: `User not found` });
  return res.json(user);
};

module.exports = userRoute;
