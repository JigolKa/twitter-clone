import { NextApiRequest } from "next";
import { JSXElementConstructor } from "react";

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
  return Object.keys(obj)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    })
    .join("&");
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function toUnix(date: Date | string) {
  return +(
    (typeof date === "string" ? new Date(date) : date).getTime() / 1000
  ).toFixed(0);
}
