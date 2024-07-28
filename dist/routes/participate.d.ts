import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const participate: {
    [name in MethodsType]?: RequestHandler;
};
export = participate;
