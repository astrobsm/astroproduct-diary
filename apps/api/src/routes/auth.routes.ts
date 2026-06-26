import { Router } from "express";
import { z } from "zod";
import { asyncHandler, badRequest, conflict, unauthorized } from "../http/errors";
import { store } from "../store/store";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken
} from "../auth/security";
import { requireAuth, requireRole } from "../auth/rbac";

export const authRouter = Router();

/** Roles a self-registering user may request. Admin-only roles are excluded. */
const REQUESTABLE_ROLES = [
  "MARKETING",
  "SALES",
  "CUSTOMER_CARE",
  "DISTRIBUTOR",
  "CLINICAL",
  "TRAINER"
] as const;

function publicUser(u: {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  roles: string[];
  locale: string;
  status: string;
}) {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    fullName: u.fullName,
    roles: u.roles,
    locale: u.locale,
    status: u.status
  };
}

// Accepts either an email address or a phone number plus password.
const loginSchema = z.object({
  identifier: z.string().min(3).optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1)
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const identifier = (body.identifier ?? body.phone ?? body.email ?? "").trim();
    if (!identifier) throw badRequest("Provide a phone number or email address");

    const user = await store.findUserByIdentifier(identifier);
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      throw unauthorized("Invalid credentials");
    }
    if (user.status === "PENDING") {
      throw unauthorized("Your account is awaiting administrator approval");
    }
    if (user.status === "REJECTED") {
      throw unauthorized("Your access request was declined. Contact the administrator.");
    }
    const accessToken = signAccessToken({ sub: user.id, email: user.email, roles: user.roles });
    const refreshToken = signRefreshToken(user.id);
    res.json({ accessToken, refreshToken, user: publicUser(user) });
  })
);

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[\d+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6).max(100),
  requestedRoles: z.array(z.enum(REQUESTABLE_ROLES)).min(1).max(REQUESTABLE_ROLES.length),
  locale: z.enum(["en", "fr"]).optional()
});

// Self-service registration. Creates a PENDING account an admin must approve.
authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existingByPhone = await store.findUserByIdentifier(data.phone);
    if (existingByPhone) throw conflict("An account with this phone number already exists");
    if (data.email) {
      const existingByEmail = await store.findUserByEmail(data.email);
      if (existingByEmail) throw conflict("An account with this email already exists");
    }
    const user = await store.createPendingUser({
      email: data.email && data.email.length > 0 ? data.email : `${data.phone}@astrobsm.local`,
      phone: data.phone,
      passwordHash: hashPassword(data.password),
      fullName: data.fullName,
      locale: data.locale ?? "en",
      requestedRoles: data.requestedRoles
    });
    res.status(201).json({
      message: "Account created. An administrator will review and approve your access.",
      user: publicUser(user)
    });
  })
);

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    let sub: string;
    try {
      ({ sub } = verifyRefreshToken(refreshToken));
    } catch {
      throw unauthorized("Invalid refresh token");
    }
    const user = await store.findUserById(sub);
    if (!user) throw unauthorized("User no longer exists");
    const accessToken = signAccessToken({ sub: user.id, email: user.email, roles: user.roles });
    res.json({ accessToken });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await store.findUserById(req.user!.sub);
    if (!user) throw unauthorized();
    res.json(publicUser(user));
  })
);

// --- Admin: registration approval queue -----------------------------------

authRouter.get(
  "/users",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const status = req.query.status;
    const filter =
      status === "PENDING" || status === "ACTIVE" || status === "REJECTED" ? status : undefined;
    const users = await store.listUsers(filter);
    res.json(
      users.map((u) => ({
        ...publicUser(u),
        requestedRoles: u.requestedRoles ?? [],
        createdAt: u.createdAt,
        approvedAt: u.approvedAt
      }))
    );
  })
);

const approveSchema = z.object({ roles: z.array(z.string().min(1)).optional() });

authRouter.post(
  "/users/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { roles } = approveSchema.parse(req.body ?? {});
    const user = await store.approveUser(String(req.params.id), req.user!.sub, roles);
    if (!user) throw badRequest("User not found");
    res.json(publicUser(user));
  })
);

authRouter.post(
  "/users/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const user = await store.rejectUser(String(req.params.id), req.user!.sub);
    if (!user) throw badRequest("User not found");
    res.json(publicUser(user));
  })
);
