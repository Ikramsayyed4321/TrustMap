import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isOperational = err instanceof AppError;
  const statusCode = isOperational ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;

  if (!isOperational && !(err instanceof ZodError)) {
    logger.error({ err }, "Unhandled API error");
  }

  res.status(statusCode).json({
    message: isOperational ? err.message : "Internal server error",
    details: isOperational && env.NODE_ENV !== "production" ? err.details : undefined
  });
};
