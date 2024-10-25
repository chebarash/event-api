import { AdminType } from "../types/types";
declare const Admins: import("mongoose").Model<AdminType, {}, {}, {}, import("mongoose").Document<unknown, {}, AdminType> & {
    accessToken: string;
    refreshToken: string;
    expires: Date;
    calendarId: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>, any>;
export default Admins;
