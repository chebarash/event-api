const users = require("../models/user");
const temp = require("../temp");

const newuser = async (ctx, tempId) => {
  const { id } = ctx.chat;
  temp[tempId].id = id;
  await users.deleteMany({ id });
  await users.deleteMany({ email: temp[tempId].email });
  return await users.insertOne(temp[tempId]);
};

module.exports = newuser;
