import { AxiosResponse } from "axios";
import { NextApiRequest } from "next";
import { JSXElementConstructor } from "react";
import { mutate } from "swr";
import { FetchedTweetSample, TweetProps } from "~/types";
import { Sort } from "./sort";

export function shuffle<T>(arr: T[]): T[] {
  const newArray = [...arr];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export const omit = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;

export const pick = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]])
  ) as Pick<T, K>;

export function cx(...classes: (string | any)[]) {
  return classes.filter(Boolean).join(" ").trim();
}

export function merge<
  T extends JSXElementConstructor<any> | keyof JSX.IntrinsicElements = "div"
>(styles: string, rest: React.ComponentProps<T>): React.ComponentProps<T> {
  return {
    ...rest,
    className: [rest.className, styles].join(" ").trim(),
  };
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class SWRError extends Error {
  info?: string;
  status?: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new SWRError("An error occurred while fetching the data.");

    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const retrieveIP = (req: NextApiRequest): string | undefined =>
  (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

export function nestedCheck<K extends string, T>(
  arr: { [key in K]: T }[],
  key: K,
  value: T
) {
  return arr.map((v) => v[key]).includes(value);
}

export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function URLParams(
  obj: Record<string, string | number | boolean>
): string {
  const arr = Object.keys(obj).map((key) => {
    return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
  });

  return arr.join("&");
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function toUnix(date: Date | string) {
  return +(
    (typeof date === "string" ? new Date(date) : date).getTime() / 1000
  ).toFixed(0);
}

var rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const units: { [key in Intl.RelativeTimeFormatUnit]?: number } = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

export function getRelativeTime(d1: Date, d2 = new Date()) {
  var elapsed = +d1 - +d2;

  const keys = Object.keys(units);
  for (let i = 0; i < keys.length; i++) {
    const unit = keys[i] as Intl.RelativeTimeFormatUnit;
    if (Math.abs(elapsed) > (units[unit] ?? 0) || unit == "second") {
      return rtf.format(Math.round(elapsed / (units[unit] ?? 1)), unit);
    }
  }

  return "Now";
}

interface Query extends Record<string, string | number> {
  take: number;
  skip: number;
  sort: Sort;
}
export function retrieveParameters(query: NextApiRequest["query"]) {
  const { per_page, page } = query;
  return {
    ...query,
    take: per_page ? +per_page : 15,
    skip: page && per_page ? +page * +per_page : 0,
  } as Query;
}

export function processCallback(
  res: AxiosResponse,
  cb: TweetProps["callback"]
) {
  switch (typeof cb) {
    case "string": {
      mutate(cb ?? "/api/tweet/feed");
      break;
    }

    case "function": {
      cb(res);
      break;
    }

    default:
      break;
  }

  return void 1;
}
