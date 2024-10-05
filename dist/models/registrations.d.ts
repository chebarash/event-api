import { Schema } from "mongoose";
import { RegistrationType } from "../types/types";
declare const Registrations: import("mongoose").Model<RegistrationType, {}, {}, {}, import("mongoose").Document<unknown, {}, RegistrationType> & {
    _id: import("mongoose").ObjectId;
    user: import("../types/types").UserType;
    event: import("../types/types").EventType;
    date: Date;
    participated?: Date;
    rate?: number;
    comment?: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Registrations;
