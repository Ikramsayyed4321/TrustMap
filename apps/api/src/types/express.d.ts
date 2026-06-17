import type { JwtUser } from "../utils/tokens.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export {};
