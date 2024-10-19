import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const participants: {
    [name in MethodsType]?: RequestHandler;
};
export = participants;
