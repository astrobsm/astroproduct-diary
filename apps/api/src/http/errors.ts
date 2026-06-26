import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/** Application error with an HTTP status and machine-readable code. */
export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (msg = "Resource not found") => new AppError(404, "NOT_FOUND", msg);
export const unauthorized = (msg = "Authentication required") =>
  new AppError(401, "UNAUTHORIZED", msg);
export const forbidden = (msg = "Insufficient permissions") =>
  new AppError(403, "FORBIDDEN", msg);
export const badRequest = (msg = "Invalid request", details?: unknown) =>
  new AppError(400, "BAD_REQUEST", msg, details);
export const conflict = (msg = "Resource already exists") =>
  new AppError(409, "CONFLICT", msg);

/** Wrap async route handlers so rejected promises reach the error middleware. */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}

/** Final error middleware — never leaks stack traces to clients. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: err.issues }
    });
  }
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  // eslint-disable-next-line no-console
  console.error("Unexpected error:", err);
  return res
    .status(500)
    .json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
}
