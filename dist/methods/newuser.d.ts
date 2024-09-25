declare const newuser: (id: number, tempId: string) => Promise<import("mongoose").UpdateWriteOpResult | (import("mongoose").Document<unknown, {}, import("../types/types").UserType> & {
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    id: number;
    organizer: boolean;
    clubs: Array<string>;
} & import("mongoose").Document<unknown, any, any> & Required<{
    _id: unknown;
}>)>;
export = newuser;
