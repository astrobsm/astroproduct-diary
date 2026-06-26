import { Router } from "express";
import { asyncHandler } from "../http/errors";
import { store } from "../store/store";
import { requireAuth } from "../auth/rbac";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

function tally<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/**
 * Sales-intelligence overview. Every figure is derived from real platform
 * records (contacts, interactions, campaigns, seminars, facilities) — there is
 * no synthetic or projected data.
 */
analyticsRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [contacts, interactions, followUps, campaigns, seminars, zones, facilities] =
      await Promise.all([
        store.listContacts(),
        store.listInteractions(),
        store.listFollowUps(),
        store.listCampaigns(),
        store.listSeminars(),
        store.listZones(),
        store.listFacilities()
      ]);

    const zoneName = new Map(zones.map((z) => [z.id, z.name]));

    const seminarRegistrations = await Promise.all(
      seminars.map((s) => store.countRegistrations(s.id))
    );
    const totalRegistrations = seminarRegistrations.reduce((a, b) => a + b, 0);

    const nowIso = new Date(now).toISOString();
    const upcomingSeminars = seminars.filter(
      (s) => s.startAt >= nowIso && s.status !== "CANCELLED"
    ).length;

    res.json({
      data: {
        generatedAt: nowIso,
        crm: {
          totalContacts: contacts.length,
          contactsByRole: tally(contacts, (c) => c.role),
          totalInteractions: interactions.length,
          interactionsByType: tally(interactions, (i) => i.type),
          interactionsLast30Days: interactions.filter((i) => i.occurredAt >= thirtyDaysAgo)
            .length,
          followUps: {
            open: followUps.filter((f) => f.status === "OPEN").length,
            done: followUps.filter((f) => f.status === "DONE").length,
            cancelled: followUps.filter((f) => f.status === "CANCELLED").length
          }
        },
        marketing: {
          totalCampaigns: campaigns.length,
          campaignsByStatus: tally(campaigns, (c) => c.status),
          totalSeminars: seminars.length,
          seminarsByStatus: tally(seminars, (s) => s.status),
          upcomingSeminars,
          totalRegistrations
        },
        network: {
          totalFacilities: facilities.length,
          facilitiesByZone: tally(facilities, (f) => zoneName.get(f.zoneId) ?? "Unassigned"),
          facilitiesByType: tally(facilities, (f) => f.type)
        }
      }
    });
  })
);
