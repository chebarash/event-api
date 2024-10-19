import { Schema } from "mongoose";
import { EventType } from "../types/types";
declare const Events: import("mongoose").Model<EventType, {}, {}, {}, import("mongoose").Document<unknown, {}, EventType> & {
    _id: import("mongoose").ObjectId;
    title: string;
    picture: string;
    description: string;
    author: import("../types/types").UserType | import("../types/types").ClubType;
    authorModel: `users` | `clubs`;
    date: Date;
    venue: string;
    duration: number;
    shares: number;
    content?: import("../types/types").ContentType;
    template?: string;
    button?: string;
    private: boolean;
    external?: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export declare const getEvents: (match?: {}) => Promise<Array<EventType>>;
export default Events;
