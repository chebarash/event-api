import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const index: {
    [name in MethodsType]?: RequestHandler;
};
export = index;
