"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { createProject, updateProject, deleteProject } from "@/lib/data/projects";
import { createBrandVoice, updateBrandVoice, deleteBrandVoice } from "@/lib/data/brand-voices";
import { createDocument, updateDocument, deleteDocument } from "@/lib/data/documents";
import { createBrandKit, deleteBrandKit } from "@/lib/data/brand-kits";
import { captureException } from "@/lib/logger";
import type { Project, BrandVoice, BrandKit, Doc } from "@/types";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80),
  description: z.string().max(280).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function createProjectAction(input: unknown): Promise<ActionResult<Project>> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  // Creating content requires editor+.
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const project = await createProject(guard.tenant.orgId, parsed.data);
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: project };
  } catch (err) {
    void captureException(err, { scope: "createProjectAction" });
    return { ok: false, error: "Could not create the project. Please try again." };
  }
}

const brandVoiceSchema = z.object({
  name: z.string().min(1, "Voice name is required").max(80),
  description: z.string().max(280).optional(),
  traits: z.array(z.string()).max(12),
  sampleText: z.string().min(1, "A writing sample is required").max(20000),
});

export async function createBrandVoiceAction(input: unknown): Promise<ActionResult<BrandVoice>> {
  const parsed = brandVoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const voice = await createBrandVoice(guard.tenant.orgId, parsed.data);
    revalidatePath("/dashboard/brand-voice");
    return { ok: true, data: voice };
  } catch (err) {
    void captureException(err, { scope: "createBrandVoiceAction" });
    return { ok: false, error: "Could not save the voice profile. Please try again." };
  }
}

const documentSchema = z.object({
  title: z.string().min(1).max(160),
  type: z.string().min(1).max(80),
  content: z.string().min(1).max(100000),
  projectId: z.string().optional(),
  status: z.enum(["draft", "in-review", "final"]).optional(),
});

export async function saveDocumentAction(input: unknown): Promise<ActionResult<Doc>> {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const doc = await createDocument(guard.tenant.orgId, guard.tenant.userId, parsed.data);
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: doc };
  } catch (err) {
    void captureException(err, { scope: "saveDocumentAction" });
    return { ok: false, error: "Could not save the document. Please try again." };
  }
}

// --- Update / Delete -------------------------------------------------------
// Updates require editor+, deletes require admin+. All are org-scoped in the
// data layer (cross-org rows return "not found"). The "ok" result of a delete
// is the deleted id so the client can update optimistically.

const NOT_FOUND = "Item not found, or you don't have access to it.";

const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Project name is required").max(80),
  description: z.string().max(280).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function updateProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const { id, ...data } = parsed.data;
    const found = await updateProject(guard.tenant.orgId, id, data);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: { id } };
  } catch (err) {
    void captureException(err, { scope: "updateProjectAction" });
    return { ok: false, error: "Could not update the project. Please try again." };
  }
}

export async function deleteProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const guard = await requireRole("admin");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const found = await deleteProject(guard.tenant.orgId, parsed.data.id);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    void captureException(err, { scope: "deleteProjectAction" });
    return { ok: false, error: "Could not delete the project. Please try again." };
  }
}

const updateDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(160).optional(),
  status: z.enum(["draft", "in-review", "final"]).optional(),
  content: z.string().max(100000).optional(),
});

export async function updateDocumentAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateDocumentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const { id, ...patch } = parsed.data;
    const found = await updateDocument(guard.tenant.orgId, id, patch);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: { id } };
  } catch (err) {
    void captureException(err, { scope: "updateDocumentAction" });
    return { ok: false, error: "Could not update the document. Please try again." };
  }
}

export async function deleteDocumentAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const guard = await requireRole("admin");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const found = await deleteDocument(guard.tenant.orgId, parsed.data.id);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    void captureException(err, { scope: "deleteDocumentAction" });
    return { ok: false, error: "Could not delete the document. Please try again." };
  }
}

const updateBrandVoiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Voice name is required").max(80),
  description: z.string().max(280).optional(),
});

export async function updateBrandVoiceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateBrandVoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const { id, ...data } = parsed.data;
    const found = await updateBrandVoice(guard.tenant.orgId, id, data);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/brand-voice");
    return { ok: true, data: { id } };
  } catch (err) {
    void captureException(err, { scope: "updateBrandVoiceAction" });
    return { ok: false, error: "Could not update the voice profile. Please try again." };
  }
}

export async function deleteBrandVoiceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const guard = await requireRole("admin");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const found = await deleteBrandVoice(guard.tenant.orgId, parsed.data.id);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/brand-voice");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    void captureException(err, { scope: "deleteBrandVoiceAction" });
    return { ok: false, error: "Could not delete the voice profile. Please try again." };
  }
}

// --- Brand kits ------------------------------------------------------------
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const brandKitSchema = z.object({
  name: z.string().min(1, "Kit name is required").max(80),
  colors: z.array(hexColor).min(1).max(8),
  fontHeading: z.string().min(1).max(60),
  fontBody: z.string().min(1).max(60),
  // Accept a data URL or http(s) URL; cap size to keep payloads sane.
  logoUrl: z.string().max(2_000_000).nullable().optional(),
});

export async function saveBrandKitAction(input: unknown): Promise<ActionResult<BrandKit>> {
  const parsed = brandKitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("editor");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const kit = await createBrandKit(guard.tenant.orgId, parsed.data);
    revalidatePath("/dashboard/visuals");
    return { ok: true, data: kit };
  } catch (err) {
    void captureException(err, { scope: "saveBrandKitAction" });
    return { ok: false, error: "Could not save the brand kit. Please try again." };
  }
}

export async function deleteBrandKitAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const guard = await requireRole("admin");
  if (!guard.ok) return { ok: false, error: guard.message };
  try {
    const found = await deleteBrandKit(guard.tenant.orgId, parsed.data.id);
    if (!found) return { ok: false, error: NOT_FOUND };
    revalidatePath("/dashboard/visuals");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    void captureException(err, { scope: "deleteBrandKitAction" });
    return { ok: false, error: "Could not delete the brand kit. Please try again." };
  }
}

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

/** Team invites are admin-only. NOTE: invitation *delivery/persistence* is not
 *  yet implemented (no Invitation model) — this enforces the org-level role
 *  gate and validates input so the UI behaves correctly. */
export async function inviteMemberAction(input: unknown): Promise<ActionResult<{ email: string; role: string }>> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const guard = await requireRole("admin");
  if (!guard.ok) return { ok: false, error: guard.message };
  return { ok: true, data: { email: parsed.data.email, role: parsed.data.role } };
}
