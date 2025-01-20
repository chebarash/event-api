import { ForYouType } from "../types/types";
declare const ForYou: import("mongoose").Model<ForYouType, {}, {}, {}, import("mongoose").Document<unknown, {}, ForYouType> & ForYouType & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default ForYou;
