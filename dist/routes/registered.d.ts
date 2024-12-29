import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const registered: {
    [name in MethodsType]?: RequestHandler;
};
export = registered;
