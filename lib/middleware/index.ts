import { pick } from "../../utils";
import { PRISMA_ERRORS, isKnownError, isPrismaError } from "../api";
import { HTTPMethod, HandlerParams, Resolver } from "../api/types";

export const resolver: Resolver = (handler, options) => {
  return async (req, res) => {
    if (
      options?.authorizedEnvironnements &&
      !options.authorizedEnvironnements.includes(process.env.NODE_ENV)
    ) {
      res.status(410).json({ error: "Gone" });
      return options?.callback?.();
    }

    const authResult = await options?.isAuthorized?.(req, res);

    if (typeof options?.isAuthorized === "function" && !authResult) {
      res.status(403).json({ error: "Forbidden" });
      return options?.callback?.();
    }

    if (
      !req.method ||
      (options?.authorizedMethods &&
        !options.authorizedMethods.includes(req.method as HTTPMethod))
    ) {
      res.status(405).json({ error: "Method Not Allowed" });
      return options?.callback?.();
    }

    const body = req.body ? pick(req.body, ...(options?.keys || [])) : {};
    if (
      options?.keys?.length &&
      !options.keys.every((v) => Object.keys(body).includes(v))
    ) {
      console.log(body);
      res.status(422).json({ error: "Unprocessable Entity" });
      return options?.callback?.();
    }

    const params: HandlerParams = {
      body,
      setHeader: (name, value) => {
        res.setHeader(name, value);
      },
      req,
      res,
      getCookie: (name) => {
        return req.cookies[name];
      },
    };

    try {
      const result = await handler(params);

      if (!result) {
        res.end();
      } else {
        res
          .status(result?.statusCode ? result.statusCode : 200)
          .json(
            typeof result.data !== "object" && !Array.isArray(result.data)
              ? { message: result.data }
              : result.data
          );
      }
      return options?.callback?.();
    } catch (error) {
      console.log("🚀 ~ file: index.ts:0000 ~ return ~ error:", error);

      res.status(500).json({
        error:
          isPrismaError(error) && isKnownError(error)
            ? PRISMA_ERRORS[error.code]
            : "Internal server error. Try again later",
      });
      return options?.callback?.();
    }
  };
};
