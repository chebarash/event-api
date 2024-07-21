import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const user: {
    [name in MethodsType]?: RequestHandler;
};
export = user;
