import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    reputationPoints: user.reputationPoints,
    badges: user.badges
  };
}

export const authService = {
  async register(input: { name: string; email: string; password: string; role?: "reviewer" | "owner" }) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(StatusCodes.CONFLICT, "This email is already registered. Please sign in or use a different email.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { name, email, role: input.role ?? "reviewer", passwordHash, lastLoginAt: new Date() }
    });
    const tokenUser = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(tokenUser);
    const refreshToken = signRefreshToken(tokenUser);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 12) }
    });
    return { user: publicUser(user), accessToken, refreshToken };
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBanned || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const tokenUser = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(tokenUser);
    const refreshToken = signRefreshToken(tokenUser);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, 12),
        lastLoginAt: new Date()
      }
    });
    return { user: publicUser(updatedUser), accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
    const tokenUser = { id: user.id, role: user.role, email: user.email };
    return {
      accessToken: signAccessToken(tokenUser),
      refreshToken: signRefreshToken(tokenUser)
    };
  }
};
