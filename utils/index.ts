import Router from "next/router";
import { JSXElementConstructor } from "react";
import { ApiRequest } from "~/lib/api/types";

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

export function copyToClipboard(str: string) {
  navigator.clipboard.writeText(str);
}

export function cx(...classes: (string | any)[]) {
  return classes.filter(Boolean).join(" ").trim();
}

export function isTrue(v: unknown) {
  return (
    (typeof v === "string" && v.toLowerCase() === "true") ||
    (typeof v === "boolean" && v)
  );
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === "object";
}

export function merge<
  T extends JSXElementConstructor<any> | keyof JSX.IntrinsicElements = "div"
>(styles: string, rest: React.ComponentProps<T>): React.ComponentProps<T> {
  return {
    ...rest,
    className: [rest.className, styles].join(" ").trim(),
  };
}

export function round(int: number, n: number = 1) {
  return +parseFloat(int.toString()).toFixed(n);
}

export function truncate(str: string, len: number = 25) {
  if (!str || str.length <= len) return str;

  return str.slice(0, len + 1) + "...";
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str; // valid date
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

export const retrieveIP = (req: ApiRequest): string | undefined =>
  (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress;

export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function getPasswordStrength(str: string) {
  let strength = 0;
  if (str.match(/[a-z]+/)) {
    strength += 1;
  }
  if (str.match(/[A-Z]+/)) {
    strength += 1;
  }
  if (str.match(/[0-9]+/)) {
    strength += 1;
  }
  if (str.match(/[$-/:-?{-~!"^_`\[\]@#&\\\/<>]+/)) {
    strength += 1;
  }

  return strength * 20 + (str.length >= 15 ? 20 : str.length * (3 / 4));
}
