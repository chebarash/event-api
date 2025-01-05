import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const vote: {
    [name in MethodsType]?: RequestHandler;
};
export = vote;
