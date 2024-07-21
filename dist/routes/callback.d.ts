import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const callback: {
    [name in MethodsType]?: RequestHandler;
};
export = callback;
