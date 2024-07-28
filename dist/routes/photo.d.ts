import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const photo: {
    [name in MethodsType]?: RequestHandler;
};
export = photo;
