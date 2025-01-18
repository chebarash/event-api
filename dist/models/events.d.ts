import { Schema } from "mongoose";
import { EventType } from "../types/types";
declare const Events: import("mongoose").Model<EventType, {}, {}, {}, import("mongoose").Document<unknown, {}, EventType> & {
    _id: import("mongoose").ObjectId;
    title: string;
    picture: string;
    fg: string;
    bg: string;
    description: string;
    author: import("../types/types").ClubType;
    date: Date;
    venue: string;
    duration: number;
    shares: number;
    private: boolean;
    registered: Array<import("../types/types").UserType>;
    participated: Array<import("../types/types").UserType>;
    hashtags: Array<string>;
    eventId: string;
    notification: {
        pre: boolean;
        post: boolean;
    };
    spots?: number;
    deadline?: Date;
    external?: string;
    content?: import("../types/types").ContentType;
    template?: string;
    button?: string;
    cancelled: boolean;
    voting?: {
        title: string;
        options: Array<string>;
        votes: Array<{
            user: import("../types/types").UserType;
            option: string;
        }>;
    };
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: Schema.Types.ObjectId;
}>, any>;
export default Events;
