import { Schema } from "mongoose";
import { UserType } from "../types/types";
declare const Users: import("mongoose").Model<UserType, {}, {}, {}, import("mongoose").Document<unknown, {}, UserType> & UserType & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Users;
