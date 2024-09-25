import { RegistrationType } from "../types/types";
declare const Registrations: import("mongoose").Model<RegistrationType, {}, {}, {}, import("mongoose").Document<unknown, {}, RegistrationType> & {
    user: import("../types/types").UserType;
    event: import("../types/types").EventType;
    date: Date;
    participated?: Date;
    rate?: number;
    comment?: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>, any>;
export default Registrations;
