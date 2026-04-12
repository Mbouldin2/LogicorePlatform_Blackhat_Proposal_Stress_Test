import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, SamSearchScheduleDoc } from "@/lib/schema";
import { searchOpportunities } from "@/lib/sam/samApiClient";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/sam/schedules/run
 * Runs all active schedules that are due, or a specific schedule by id.
 * Call this from a cron job (e.g. Vercel Cron, GitHub Actions).
 */
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const body = await req.json().catch(() => ({}));
    const specificId: string | undefined = body.id;

    const col = collection(db, COLLECTIONS.SAM_SEARCH_SCHEDULES);
    let schedules: SamSearchScheduleDoc[] = [];

    if (specificId) {
      const snap = await getDocs(query(col, where("__name__", "==", specificId)));
      schedules = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SamSearchScheduleDoc));
    } else {
      const snap = await getDocs(query(col, where("isActive", "==", true)));
      schedules = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SamSearchScheduleDoc));
    }

    const now = new Date();
    const results: Array<{ id: string; name: string; sent: boolean; count: number; error?: string }> = [];

    for (const schedule of schedules) {
      // Check if schedule is due
      if (!specificId && schedule.nextRunAt) {
        const nextRun = (schedule.nextRunAt as any).toDate?.() ?? new Date(schedule.nextRunAt as any);
        if (nextRun > now) {
          results.push({ id: schedule.id, name: schedule.name, sent: false, count: 0 });
          continue;
        }
      }

      try {
        // Run the search
        const searchResult = await searchOpportunities({
          q: schedule.query,
          naics_code: schedule.filters?.naicsCode,
          psc_code: schedule.filters?.pscCode,
          set_aside: schedule.filters?.setAside,
          notice_type: schedule.filters?.noticeType,
          pop_state: schedule.filters?.popState,
          is_active: schedule.filters?.isActive,
          limit: 100,
        });

        const opps = searchResult.opportunities.slice(0, 50);
        const count = opps.length;

        // Build email HTML
        const html = buildEmailHtml(schedule.name, schedule.query, searchResult.totalRecords, opps);

        // Send to all recipients
        const emailResult = await sendEmail({
          to: schedule.emailRecipients,
          subject: schedule.emailSubject || `SAM.gov Opportunities: ${schedule.query}`,
          html,
        });

        // Compute next run time
        const nextRunAt = computeNextRun(schedule.schedule, schedule.scheduleDay, schedule.scheduleHour ?? 8);

        // Update schedule record
        await updateDoc(doc(db, COLLECTIONS.SAM_SEARCH_SCHEDULES, schedule.id), {
          lastRunAt: Timestamp.now(),
          nextRunAt: Timestamp.fromDate(nextRunAt),
          lastResultCount: count,
          updatedAt: Timestamp.now(),
        });

        results.push({ id: schedule.id, name: schedule.name, sent: emailResult.success, count });
      } catch (err: any) {
        results.push({ id: schedule.id, name: schedule.name, sent: false, count: 0, error: err.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function computeNextRun(schedule: string, scheduleDay?: number, scheduleHour = 8): Date {
  const next = new Date();
  next.setUTCHours(scheduleHour, 0, 0, 0);

  switch (schedule) {
    case "daily":
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "weekly":
      const targetDay = scheduleDay ?? 1; // Monday default
      const daysUntil = (targetDay - next.getUTCDay() + 7) % 7 || 7;
      next.setUTCDate(next.getUTCDate() + daysUntil);
      break;
    case "biweekly":
      next.setUTCDate(next.getUTCDate() + 14);
      break;
    case "monthly":
      next.setUTCMonth(next.getUTCMonth() + 1);
      if (scheduleDay) next.setUTCDate(scheduleDay);
      break;
    default:
      next.setUTCDate(next.getUTCDate() + 7);
  }
  return next;
}

function buildEmailHtml(scheduleName: string, searchQuery: string, totalFound: number, opps: any[]): string {
  const rows = opps.map((opp, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px 8px;font-weight:600;color:#374151;">${i + 1}</td>
      <td style="padding:12px 8px;">
        <a href="${opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`}" style="color:#1e3a5f;font-weight:600;text-decoration:none;">
          ${opp.title}
        </a>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">
          ${opp.department || opp.organizationHierarchy?.split(".")[0] || "Unknown Agency"}
        </div>
      </td>
      <td style="padding:12px 8px;font-size:13px;color:#374151;">${opp.noticeId || "N/A"}</td>
      <td style="padding:12px 8px;font-size:13px;color:#059669;">${formatDate(opp.postedDate)}</td>
      <td style="padding:12px 8px;font-size:13px;color:#d97706;">${formatDate(opp.responseDeadLine) || "Not specified"}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>SAM.gov Opportunities</title></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;">
  <div style="max-width:900px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">SAM.gov Opportunity Alert</h1>
      <p style="color:#93c5fd;margin:8px 0 0;">${scheduleName}</p>
    </div>
    <div style="padding:24px 32px;">
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:24px;display:flex;gap:32px;">
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Query</div><div style="font-weight:600;color:#1e3a5f;">${searchQuery}</div></div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Total Found</div><div style="font-weight:700;font-size:24px;color:#1e3a5f;">${totalFound.toLocaleString()}</div></div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">In This Email</div><div style="font-weight:700;font-size:24px;color:#1e3a5f;">${opps.length}</div></div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Sent</div><div style="font-weight:600;color:#374151;">${new Date().toLocaleDateString()}</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">#</th>
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Opportunity</th>
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Notice ID</th>
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Posted</th>
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">Response Due</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:24px;text-align:center;">
        <a href="https://sam.gov" style="background:#1e3a5f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          View All on SAM.gov
        </a>
      </div>
    </div>
    <div style="background:#f3f4f6;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;">
      This is an automated alert from Strategic Value Plus. To manage your alerts, log in to the platform.
    </div>
  </div>
</body>
</html>`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}
