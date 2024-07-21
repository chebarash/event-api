import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const event: {
    [name in MethodsType]?: RequestHandler;
};
export = event;
