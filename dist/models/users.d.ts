import { Schema } from "mongoose";
import { UserType } from "../types/types";
declare const Users: import("mongoose").Model<UserType, {}, {}, {}, import("mongoose").Document<unknown, {}, UserType> & {
    _id: import("mongoose").ObjectId;
    name: string;
    picture?: string;
    email: string;
    id: number;
    organizer: boolean;
    member: Array<import("../types/types").ClubType>;
    clubs: Array<import("../types/types").ClubType>;
    phone?: string;
    joined: boolean;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Users;
