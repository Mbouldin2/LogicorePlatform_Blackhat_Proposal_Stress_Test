"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/data/tenant";
import { createProject } from "@/lib/data/projects";
import { createBrandVoice } from "@/lib/data/brand-voices";
import { createDocument } from "@/lib/data/documents";
import type { Project, BrandVoice, Doc } from "@/types";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80),
  description: z.string().max(280).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function createProjectAction(input: unknown): Promise<ActionResult<Project>> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const { orgId } = await getTenant();
    const project = await createProject(orgId, parsed.data);
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: project };
  } catch (err) {
    console.error("[createProjectAction]", err);
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
  try {
    const { orgId } = await getTenant();
    const voice = await createBrandVoice(orgId, parsed.data);
    revalidatePath("/dashboard/brand-voice");
    return { ok: true, data: voice };
  } catch (err) {
    console.error("[createBrandVoiceAction]", err);
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
  try {
    const { orgId, userId } = await getTenant();
    const doc = await createDocument(orgId, userId, parsed.data);
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard");
    return { ok: true, data: doc };
  } catch (err) {
    console.error("[saveDocumentAction]", err);
    return { ok: false, error: "Could not save the document. Please try again." };
  }
}
