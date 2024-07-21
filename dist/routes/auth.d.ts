import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const auth: {
    [name in MethodsType]?: RequestHandler;
};
export = auth;
