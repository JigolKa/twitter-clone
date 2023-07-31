import { serialize } from "cookie";
import jwt from "jsonwebtoken";

import { NextRequest } from "next/server";
import {
  CrossServerRequest,
  HandlerParams,
  Response,
  Session,
} from "~/lib/api/types";
import { isExisting } from "./isExisting";

export type JWTPayload = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
};

export type FullJWTPayload = JWTPayload & {
  iat: number;
  exp: number;
};

export type CreateJWTArgument = JWTPayload & {
  exp?: string | number;
};

export const JWT_COOKIE_NAME = "token";
export const TOKEN_VALIDITY_HOURS = 4;

export function createJWT({
  email,
  isAdmin,
  id,
  firstName,
  lastName,
}: Session) {
  const token = jwt.sign(
    { email, isAdmin, id, firstName, lastName } as Session,
    process.env.JWT_KEY!,
    {
      expiresIn: `${TOKEN_VALIDITY_HOURS}h`,
    }
  );

  return token;
}

export function retrieveToken(req: CrossServerRequest) {
  return req instanceof NextRequest
    ? req.cookies.get("token")?.value
    : req.cookies?.[JWT_COOKIE_NAME] || undefined;
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_KEY!) as JWTPayload & {
    iat: number;
    exp: number;
  };
}

export type WithRequest = {
  req: CrossServerRequest;
  token?: undefined;
};

export type WithToken = {
  token: string | undefined;
  req?: undefined;
};

export async function isTokenValid({
  req,
  token: _token,
}: WithRequest | WithToken) {
  const token = _token ? _token : req ? retrieveToken(req) : null;

  if (!token) return false;

  try {
    const decoded = verifyToken(token);

    const isValid = await isExisting({ email: decoded.email });

    if (!isValid) {
      return false;
    }

    return { decoded, user: isValid };
  } catch (error) {
    console.log("🚀 ~ file: index.ts:97 ~ error:", error);
    return false;
  }
}

export const setJWTCookie = (token: string) => {
  const dt = new Date();
  dt.setHours(dt.getHours() + TOKEN_VALIDITY_HOURS);

  return serialize(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? !true : false,
    expires: dt,
    path: "/",
    sameSite: "strict",
  });
};

export const setLoginCookie = (
  res: Response | HandlerParams,
  token: string
) => {
  res.setHeader("Set-Cookie", setJWTCookie(token));
};

export const logout = (res: Response | HandlerParams) => {
  res.setHeader(
    "Set-Cookie",
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
};
