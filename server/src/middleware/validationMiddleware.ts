import type { RequestHandler } from "express";
import type { z } from "zod";

export function validate(
  schema: z.ZodType,
  source: "body" | "params" = "body",
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    req[source] = result.data as never;
    next();
  };
}
