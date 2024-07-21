import { Schema } from "mongoose";
import { RegistrationType } from "../types/types";
declare const Registrations: import("mongoose").Model<RegistrationType, {}, {}, {}, import("mongoose").Document<unknown, {}, RegistrationType> & RegistrationType & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Registrations;
