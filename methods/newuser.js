const users = require(`../models/user`);
const temp = require(`../temp`);

const newuser = async (id, tempId) => {
  temp[tempId].id = id;
  if (await users.findOne({ email: temp[tempId].email }))
    return await users.updateOne({ email: temp[tempId].email }, temp[tempId]);
  return await users.insertOne(temp[tempId]);
};

module.exports = newuser;
