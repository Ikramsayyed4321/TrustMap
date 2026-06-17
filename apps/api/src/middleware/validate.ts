import type { AnyZodObject } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function validate(schema: AnyZodObject) {
  return asyncHandler(async (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid request", result.error.flatten());
    }

    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    req.query = result.data.query ?? req.query;
    next();
  });
}
