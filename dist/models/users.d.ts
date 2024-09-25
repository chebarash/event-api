import { UserType } from "../types/types";
declare const Users: import("mongoose").Model<UserType, {}, {}, {}, import("mongoose").Document<unknown, {}, UserType> & {
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    id: number;
    organizer: boolean;
    clubs: Array<string>;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>, any>;
export default Users;
