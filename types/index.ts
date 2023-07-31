import { IncomingMessage } from "http";
import { NextApiRequest } from "next";
import { AppProps as _AppProps } from "next/app";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { NextRequest } from "next/server";
import { ComponentProps } from "react";

export type Theme = "mto" | "amv" | "cda" | "nrs" | "his" | "ang";

export type BasicProps<T extends keyof JSX.IntrinsicElements = "div"> =
  ComponentProps<T>;

export type UnwrapPromise<T> = T extends Promise<infer D> ? D : T;

export type CrossServerRequest =
  | NextApiRequest
  | (IncomingMessage & {
      cookies: NextApiRequestCookies;
    })
  | NextRequest;

export type AppProps = _AppProps & {
  Component: _AppProps["Component"] & {
    container?: boolean;
  };
};

export type Component = AppProps["Component"];

declare global {
  namespace PrismaJson {
    type TrainingGrades = {
      [key in Theme]?: number[];
    };

    type Answers = { isCorrect: boolean; value: string }[];

    type FailedQuestion = {
      questionId: string;
      theme: Theme;
      failedAt: Date;
    }[];
  }
}
