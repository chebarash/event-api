import { Schema } from "mongoose";
import { ClubType } from "../types/types";
declare const Clubs: import("mongoose").Model<ClubType, {}, {}, {}, import("mongoose").Document<unknown, {}, ClubType> & {
    _id: import("mongoose").ObjectId;
    username: string;
    name: string;
    description: string;
    links: Array<{
        url: string;
        text: string;
    }>;
    cover: string;
    hidden: boolean;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Clubs;
