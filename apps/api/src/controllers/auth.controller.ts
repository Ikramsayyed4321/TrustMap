import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  signed: true,
  maxAge: 30 * 24 * 60 * 60 * 1000
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    res.status(StatusCodes.CREATED).json({ user: result.user, accessToken: result.accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    res.json({ user: result.user, accessToken: result.accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.signedCookies.refreshToken ?? req.body.refreshToken;
    const result = await authService.refresh(refreshToken);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    res.json({ accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (_req, res) => {
    res.clearCookie("refreshToken");
    res.status(StatusCodes.NO_CONTENT).send();
  })
};
