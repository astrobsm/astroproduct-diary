import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../http/errors";
import { verifyAccessToken, type AccessClaims } from "./security";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessClaims;
    }
  }
}

/** Require a valid access token; attaches claims to req.user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(unauthorized());
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
}

/** Require at least one of the given roles. Use after requireAuth. */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    const hasRole = req.user.roles.some((r) => roles.includes(r));
    if (!hasRole) return next(forbidden(`Requires one of: ${roles.join(", ")}`));
    next();
  };
}
