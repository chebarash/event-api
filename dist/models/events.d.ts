import { Schema } from "mongoose";
import { EventType } from "../types/types";
declare const Events: import("mongoose").Model<EventType, {}, {}, {}, import("mongoose").Document<unknown, {}, EventType> & EventType & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export declare const getEvents: (match?: {}) => Promise<Array<EventType>>;
export default Events;
