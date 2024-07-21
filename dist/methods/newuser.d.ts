declare const newuser: (id: number, tempId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../types/types").UserType> & import("../types/types").UserType & Required<{
    _id: import("mongoose").Schema.Types.ObjectId;
}>) | import("mongoose").UpdateWriteOpResult>;
export = newuser;
