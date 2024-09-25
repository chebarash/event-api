import { EventType } from "../types/types";
declare const Events: import("mongoose").Model<EventType, {}, {}, {}, import("mongoose").Document<unknown, {}, EventType> & {
    title: string;
    picture: string;
    description: string;
    authors: Array<import("../types/types").UserType>;
    date: Date;
    venue: string;
    duration: number;
    content?: import("../types/types").ContentType;
    template?: string;
    button?: string;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>, any>;
export declare const getEvents: (match?: {}) => Promise<Array<EventType>>;
export default Events;
