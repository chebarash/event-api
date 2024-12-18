import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const clubs: {
    [name in MethodsType]?: RequestHandler;
};
export = clubs;
