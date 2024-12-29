import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const participated: {
    [name in MethodsType]?: RequestHandler;
};
export = participated;
