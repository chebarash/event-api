import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const notification: {
    [name in MethodsType]?: RequestHandler;
};
export = notification;
