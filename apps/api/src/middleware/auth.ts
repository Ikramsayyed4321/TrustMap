import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  req.user = verifyAccessToken(token);
  next();
});

export function authorize(...roles: Array<"admin" | "reviewer" | "owner">) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Insufficient permissions");
    }
    next();
  });
}
