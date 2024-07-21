import { RequestHandler } from "express";
import { MethodsType } from "../types/types";
declare const registration: {
    [name in MethodsType]?: RequestHandler;
};
export = registration;
