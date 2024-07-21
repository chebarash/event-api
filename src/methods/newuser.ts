import Users from "../models/users";
import temp from "../temp";

const newuser = async (id: number, tempId: string) => {
  temp[tempId].id = id;
  if (await Users.findOne({ email: temp[tempId].email }))
    return await Users.updateOne({ email: temp[tempId].email }, temp[tempId]);
  return await new Users(temp[tempId]).save();
};

export = newuser;
