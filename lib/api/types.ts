import { PrismaClient, User } from "@prisma/client";
import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { NextRequest } from "next/server";
import { ComponentProps, Dispatch, SetStateAction } from "react";
import { isTokenValid } from "../../utils/auth";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

export type KnownKeys<T> = {
  [K in keyof T]: string extends K
    ? never
    : number extends K
    ? never
    : symbol extends K
    ? never
    : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;
export type MaybePromise<T> = T | Promise<T>;

type ErrorResponseBody = { error: string; [key: string]: unknown };

type Send<T> = (body: T) => void;

export type Response<T extends object = object> = Omit<
  NextApiResponse,
  "end"
> & {
  end: () => void;
  json: Send<T>;
};

export type ApiRequest<Q extends string = "crud"> = Omit<
  NextApiRequest,
  "query"
> & {
  query: {
    [key in Q]: [Model, string | undefined];
  } & Record<string, unknown>;
};

export type Handler = (
  // req: Request,
  params: HandlerParams
) => Promise<HandlerResponse> | HandlerResponse;

export type HandlerParams = {
  body: { [key: string]: any };
  user: User | null;
  setHeader: (name: string, value: string) => void;
  getCookie: (name: string) => string | undefined;
};

type HandlerResponse =
  | { data: object | object[] | string | boolean | null; statusCode?: number }
  | undefined
  | void;

export type Resolver = (
  handler: Handler,
  options?: Partial<ResolverOptions>
) => (req: ApiRequest, res: Response<ErrorResponseBody | object>) => void;

export interface ResolverOptions {
  isLoginRequired: boolean | PartialRecord<HTTPMethod, boolean>;
  authorizedMethods: HTTPMethod[];
  authorizedEnvironnements: (typeof process.env.NODE_ENV)[];
  callback: () => MaybePromise<void>;
  keys: string[];
}

export type PrismaError =
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientInitializationError
  | PrismaClientValidationError;

export type HTTPMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export type PartialRecord<K extends string | number | symbol, T> = {
  [P in K]?: T;
};

type NotStartingWith<
  Set,
  Needle extends string
> = Set extends `${Needle}${infer _X}` ? never : Set;

export type Model = NotStartingWith<keyof PrismaClient, "$">;

export type UseState<T> = Dispatch<SetStateAction<T>>;

export type UnwrapPromise<T> = T extends Promise<infer D> ? D : T;

export type CrossServerRequest =
  | NextApiRequest
  | (IncomingMessage & {
      cookies: NextApiRequestCookies;
    })
  | NextRequest;

export type MiddlewareToken = Exclude<
  UnwrapPromise<ReturnType<typeof isTokenValid>>,
  false
>;

export interface Session {
  email: string;
  isAdmin: boolean;
  id: string;
  firstName: string;
  lastName: string;
}
