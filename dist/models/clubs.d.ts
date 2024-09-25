import { ClubType } from "../types/types";
declare const Clubs: import("mongoose").Model<ClubType, {}, {}, {}, import("mongoose").Document<unknown, {}, ClubType> & {
    username: string;
    name: string;
    description: string;
    links: Array<{
        url: string;
        text: string;
    }>;
    cover: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>, any>;
export default Clubs;
