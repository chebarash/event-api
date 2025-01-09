import { Schema } from "mongoose";
import { ClubType } from "../types/types";
declare const Clubs: import("mongoose").Model<ClubType, {}, {}, {}, import("mongoose").Document<unknown, {}, ClubType> & {
    _id: import("mongoose").ObjectId;
    name: string;
    description: string;
    channel?: string;
    cover: string;
    color: string;
    hidden: boolean;
    leader: import("../types/types").UserType;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Clubs;
