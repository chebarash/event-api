import { Schema } from "mongoose";
import { UserExtendedType, UserType } from "../types/types";
declare const Users: import("mongoose").Model<UserType, {}, {}, {}, import("mongoose").Document<unknown, {}, UserType> & {
    _id: import("mongoose").ObjectId;
    name: string;
    picture?: string;
    email: string;
    id: number;
    organizer: boolean;
    member: Array<import("../types/types").ClubType>;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export declare const getUser: (match?: {}) => Promise<UserExtendedType | null>;
export default Users;
